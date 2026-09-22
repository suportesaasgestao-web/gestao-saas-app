<?php
/**
 * Recuperação e redefinição de senha com tokens seguros
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/Database.php';

use ConfigDatabase;

$action = $_GET['action'] ?? 'request';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$pdo = Database::getConnection();

if ($action === 'request') {
    // 1. Solicita recuperação enviando o e-mail
    $email = trim($input['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Por favor insira um e-mail válido.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email = :email AND ativo = 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Por segurança, resposta neutra
        echo json_encode([
            'success' => true, 
            'message' => 'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.'
        ]);
        exit;
    }

    // Gera token seguro de 64 caracteres
    $token = bin2hex(random_bytes(32));
    $expiraEm = date('Y-m-d H:i:s', strtotime('+2 hours'));

    $stmtToken = $pdo->prepare("
        INSERT INTO tokens_recuperacao (email, token, expira_em, usado)
        VALUES (:email, :token, :expira_em, 0)
    ");
    $stmtToken->execute([
        ':email' => $email,
        ':token' => $token,
        ':expira_em' => $expiraEm
    ]);

    // Simulação do envio de e-mail (usar mail() ou PHPMailer em ambiente de produção)
    $linkRecuperacao = "http://" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "/login.php?token=" . $token;

    echo json_encode([
        'success' => true,
        'message' => 'E-mail de recuperação gerado com sucesso!',
        'simulated_email' => [
            'to' => $email,
            'subject' => 'Recuperação de Senha - GestãoSaaS',
            'token' => $token,
            'link' => $linkRecuperacao,
            'expires' => $expiraEm
        ]
    ]);
    exit;
}

if ($action === 'reset') {
    // 2. Redefine a senha com o token fornecido
    $token = trim($input['token'] ?? '');
    $novaSenha = trim($input['nova_senha'] ?? '');

    if (empty($token) || empty($novaSenha)) {
        echo json_encode(['success' => false, 'message' => 'Token e nova senha são obrigatórios.']);
        exit;
    }

    if (strlen($novaSenha) < 6) {
        echo json_encode(['success' => false, 'message' => 'A senha deve ter no mínimo 6 caracteres.']);
        exit;
    }

    $stmtCheck = $pdo->prepare("
        SELECT id, email FROM tokens_recuperacao 
        WHERE token = :token AND usado = 0 AND expira_em > NOW()
        ORDER BY id DESC LIMIT 1
    ");
    $stmtCheck->execute([':token' => $token]);
    $tokenData = $stmtCheck->fetch();

    if (!$tokenData) {
        echo json_encode(['success' => false, 'message' => 'Token inválido ou expirado. Solicite uma nova recuperação.']);
        exit;
    }

    $novaHash = password_hash($novaSenha, PASSWORD_BCRYPT, ['cost' => 12]);

    $pdo->beginTransaction();
    $updateSenha = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE email = :email");
    $updateSenha->execute([':senha' => $novaHash, ':email' => $tokenData['email']]);

    $updateToken = $pdo->prepare("UPDATE tokens_recuperacao SET usado = 1 WHERE id = :id");
    $updateToken->execute([':id' => $tokenData['id']]);
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Sua senha foi redefinida com sucesso! Agora você já pode fazer login.']);
    exit;
}
