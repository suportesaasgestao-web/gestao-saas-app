<?php
/**
 * Conexão com Banco de Dados usando PDO
 * Auto-criação de banco e tabelas se não existirem
 */

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    
    // Configurações padrão (podem ser lidas de variáveis de ambiente .env)
    private static string $host = 'localhost';
    private static string $dbName = 'gestao_saas';
    private static string $user = 'root';
    private static string $pass = '';
    private static string $charset = 'utf8mb4';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                // Carrega variáveis se existirem
                self::$host = getenv('DB_HOST') ?: self::$host;
                self::$dbName = getenv('DB_NAME') ?: self::$dbName;
                self::$user = getenv('DB_USER') ?: self::$user;
                self::$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : self::$pass;

                // 1. Conecta inicialmente sem selecionar o DB para verificar se existe
                $dsnWithoutDb = "mysql:host=" . self::$host . ";charset=" . self::$charset;
                $pdoInit = new PDO($dsnWithoutDb, self::$user, self::$pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ]);

                // Cria o banco caso não exista
                $pdoInit->exec("CREATE DATABASE IF NOT EXISTS `" . self::$dbName . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

                // 2. Conecta agora ao banco de dados específico
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbName . ";charset=" . self::$charset;
                self::$instance = new PDO($dsn, self::$user, self::$pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);

                // 3. Executa verificação e criação automática de tabelas
                self::bootstrapTables(self::$instance);

            } catch (PDOException $e) {
                // Resposta segura em JSON sem expor credenciais
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro de conexão com o banco de dados.',
                    'error' => $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$instance;
    }

    /**
     * Criação automática das tabelas essenciais se não existirem
     */
    private static function bootstrapTables(PDO $pdo): void {
        $schemaPath = __DIR__ . '/../database/schema.sql';
        if (file_exists($schemaPath)) {
            $sql = file_get_contents($schemaPath);
            // Executa instruções
            $pdo->exec($sql);
        }
    }
}
