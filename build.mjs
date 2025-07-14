import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { minify } from 'terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildProject() {
  try {
    console.log('🏗️  Iniciando build: Produção - minificado e ofuscado...');
    
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
    
    // Build com esbuild (sem minificação ainda)
    await build({
      entryPoints: [mainTempPath],
      bundle: true,
      minify: false, // Desabilitado para usar Terser depois
      format: 'esm',
      target: 'es2020',
      outfile: join(__dirname, 'dist', 'main.temp.js'),
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

    console.log('📦 Bundle criado, aplicando minificação e ofuscação...');

    // Ler o arquivo gerado pelo esbuild
    const bundledPath = join(__dirname, 'dist', 'main.temp.js');
    let bundledContent = readFileSync(bundledPath, 'utf-8');

    // Aplicar minificação com Terser
    console.log('⚡ Aplicando minificação avançada...');
    const minifyResult = await minify(bundledContent, {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true, // Remove debugger
        dead_code: true,
        unused: true,
        reduce_vars: true,
        collapse_vars: true,
        conditionals: true,
        booleans: true,
        loops: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        sequences: true,
        evaluate: true,
        properties: true
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/ // Mangle propriedades que começam com _
        }
      },
      format: {
        comments: false // Remove comentários
      }
    });

    if (minifyResult.error) {
      throw new Error(`Erro na minificação: ${minifyResult.error}`);
    }

    // Aplicar ofuscação pesada
    console.log('🔒 Aplicando ofuscação pesada...');
    const obfuscatedResult = JavaScriptObfuscator.obfuscate(minifyResult.code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.5,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.2,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 5,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 4,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.8,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });

    // Salvar arquivo final
    const finalOutputPath = join(__dirname, 'dist', 'main.js');
    writeFileSync(finalOutputPath, obfuscatedResult.getObfuscatedCode());

    // Remover arquivo temporário do esbuild
    unlinkSync(bundledPath);

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
    console.log('🔒 Código minificado e ofuscado aplicado');
    
    // Mostrar estatísticas do arquivo
    const finalStats = readFileSync(finalOutputPath, 'utf-8');
    const finalSize = (finalStats.length / 1024).toFixed(2);
    console.log(`📊 Tamanho final: ${finalSize} KB`);
    
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    
    // Limpar arquivos temporários em caso de erro
    try {
      const tempSrcPath = join(__dirname, 'temp-src');
      const mainTempPath = join(tempSrcPath, 'main.tsx');
      const alertsTempPath = join(tempSrcPath, 'alerts.tsx');
      const bundledPath = join(__dirname, 'dist', 'main.temp.js');
      
      unlinkSync(mainTempPath);
      unlinkSync(alertsTempPath);
      unlinkSync(tempSrcPath);
      unlinkSync(bundledPath);
    } catch (cleanupError) {
      // Ignorar erros de limpeza
    }
    
    process.exit(1);
  }
}

buildProject();