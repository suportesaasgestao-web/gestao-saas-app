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
    
    private static string $host = '';
    private static string $dbName = '';
    private static string $user = '';
    private static string $pass = '';
    private static string $charset = 'utf8mb4';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                self::$host = trim((string) getenv('DB_HOST'));
                self::$dbName = trim((string) getenv('DB_NAME'));
                self::$user = trim((string) getenv('DB_USER'));
                self::$pass = (string) getenv('DB_PASS');

                if (self::$host === '' || self::$dbName === '' || self::$user === '' || self::$pass === '') {
                    throw new PDOException('As variáveis DB_HOST, DB_NAME, DB_USER e DB_PASS são obrigatórias.');
                }

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
