import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
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
    
    // Ler o CSS gerado pelo Tailwind
    const cssPath = join(__dirname, 'dist', 'styles.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    
    // Ler o HTML do modal
    const htmlPath = join(__dirname, 'src', 'modal.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    // Ler o código TypeScript e substituir os placeholders
    const tsPath = join(__dirname, 'src', 'main.ts');
    let tsContent = readFileSync(tsPath, 'utf-8');
    
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
    
    // Substituir placeholders
    tsContent = tsContent.replace('__CSS_CONTENT__', escapeForJS(cssContent));
    tsContent = tsContent.replace('__HTML_CONTENT__', escapeForJS(htmlContent));
    
    // Criar arquivo temporário com conteúdo processado
    const tempTsPath = join(__dirname, 'temp-main.ts');
    writeFileSync(tempTsPath, tsContent);
    
    // Build com esbuild
    await build({
      entryPoints: [tempTsPath],
      bundle: true,
      minify: true,
      format: 'esm',
      target: 'es2020',
      outfile: join(__dirname, 'dist', 'main.js'),
      platform: 'browser',
      treeShaking: true,
      sourcemap: false,
    });
    
    // Remover arquivo temporário
    unlinkSync(tempTsPath);
    
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
    process.exit(1);
  }
}

buildProject();
