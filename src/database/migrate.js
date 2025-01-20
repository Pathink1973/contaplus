const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');

const runMigrations = async () => {
  try {
    // Criar tabela de migrations se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ler arquivos de migration
    const migrationFiles = await fs.readdir(path.join(__dirname, 'migrations'));
    const executedMigrations = await pool.query('SELECT name FROM migrations');
    const executedMigrationNames = executedMigrations.rows.map(row => row.name);

    // Filtrar e ordenar migrations não executadas
    const pendingMigrations = migrationFiles
      .filter(file => !executedMigrationNames.includes(file))
      .sort();

    // Executar migrations pendentes
    for (const migrationFile of pendingMigrations) {
      console.log(`Executando migration: ${migrationFile}`);
      
      const sql = await fs.readFile(
        path.join(__dirname, 'migrations', migrationFile),
        'utf8'
      );

      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migrationFile]
        );
        await pool.query('COMMIT');
        console.log(`Migration ${migrationFile} executada com sucesso`);
      } catch (err) {
        await pool.query('ROLLBACK');
        console.error(`Erro ao executar migration ${migrationFile}:`, err);
        process.exit(1);
      }
    }

    console.log('Todas as migrations foram executadas');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao executar migrations:', err);
    process.exit(1);
  }
};

runMigrations(); 