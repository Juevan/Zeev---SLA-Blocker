import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildProject() {
  try {
    console.log('🏗️  Iniciando build...');
    
    // Criar pasta dist se não existir
    const distPath = join(__dirname, 'dist');
    if (!existsSync(distPath)) {
      mkdirSync(distPath, { recursive: true });
      console.log('📁 Pasta dist criada');
    }
    
    // Criar pasta temporária para src se não existir
    const tempSrcPath = join(__dirname, 'temp-src');
    if (!existsSync(tempSrcPath)) {
      mkdirSync(tempSrcPath, { recursive: true });
    }
    
    // Ler o CSS gerado pelo Tailwind
    const cssPath = join(__dirname, 'dist', 'styles.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    
    // Função para escapar string para JavaScript
    function escapeForJS(str) {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    }
    
    // Copiar alerts.tsx para pasta temporária
    const alertsSourcePath = join(__dirname, 'src', 'alerts.tsx');
    const alertsTempPath = join(tempSrcPath, 'alerts.tsx');
    copyFileSync(alertsSourcePath, alertsTempPath);
    
    // Ler e processar o arquivo main.tsx
    const mainSourcePath = join(__dirname, 'src', 'main.tsx');
    let mainContent = readFileSync(mainSourcePath, 'utf-8');
    
    // Substituir placeholders
    mainContent = mainContent.replace('__CSS_CONTENT__', escapeForJS(cssContent));
    
    // Criar arquivo temporário processado
    const mainTempPath = join(tempSrcPath, 'main.tsx');
    writeFileSync(mainTempPath, mainContent);
    
    // Build com esbuild
    await build({
      entryPoints: [mainTempPath],
      bundle: true,
      minify: true,
      format: 'esm',
      target: 'es2020',
      outfile: join(__dirname, 'dist', 'main.js'),
      platform: 'browser',
      treeShaking: true,
      sourcemap: false,
      jsx: 'automatic',
      jsxImportSource: 'preact',
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      }
    });
    
    // Remover pasta temporária
    unlinkSync(mainTempPath);
    unlinkSync(alertsTempPath);
    try {
      unlinkSync(tempSrcPath);
    } catch (error) {
      // Pasta pode não estar vazia, ignorar
    }
    
    // Remover CSS temporário (já está embutido no JS)
    const tempCssPath = join(__dirname, 'dist', 'styles.css');
    try {
      unlinkSync(tempCssPath);
    } catch (error) {
      // Ignorar se o arquivo não existir
    }
    
    console.log('✅ Build concluído com sucesso!');
    console.log('📁 Arquivo gerado: dist/main.js');
    
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    
    // Limpar arquivos temporários em caso de erro
    try {
      const tempSrcPath = join(__dirname, 'temp-src');
      const mainTempPath = join(tempSrcPath, 'main.tsx');
      const alertsTempPath = join(tempSrcPath, 'alerts.tsx');
      
      unlinkSync(mainTempPath);
      unlinkSync(alertsTempPath);
      unlinkSync(tempSrcPath);
    } catch (cleanupError) {
      // Ignorar erros de limpeza
    }
    
    process.exit(1);
  }
}

buildProject();
