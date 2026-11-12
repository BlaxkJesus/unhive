import ts from 'typescript';
import path from 'path';

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  console.log('No tsconfig found');
  process.exit(1);
}
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');
const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);

const targetPath = path.resolve('src/db/prisma.ts');
const sourceFile = program.getSourceFiles().find((f) => path.resolve(f.fileName) === targetPath);

if (!sourceFile) {
  console.log('Source file not found in program:', targetPath);
} else {
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ];

  console.log(`Diagnostics count for ${sourceFile.fileName}: ${diagnostics.length}`);
  for (const d of diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    const pos = d.file ? d.file.getLineAndCharacterOfPosition(d.start || 0) : { line: 0, character: 0 };
    console.log(`Line ${pos.line + 1}:${pos.character + 1} - TS${d.code}: ${msg}`);
  }
}
