const fs = require('fs');
const path = require('path');

const fileExtensions = ['.tsx', '.ts'];

const replacements = {
  // Ordered from longest to shortest to avoid partial matching, but using word boundaries helps.
  'border-slate-800/50': 'border-slate-200 dark:border-slate-800/50',
  'bg-slate-900/80': 'bg-white/80 dark:bg-slate-900/80',
  'bg-slate-900/50': 'bg-white/50 dark:bg-slate-900/50',
  'bg-slate-800/50': 'bg-slate-100/50 dark:bg-slate-800/50',
  'border-slate-200/20': 'border-slate-300 dark:border-slate-200/20',
  
  'bg-slate-950': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-900': 'bg-white dark:bg-slate-900',
  'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
  
  'text-slate-50': 'text-slate-900 dark:text-slate-50',
  'text-white': 'text-slate-900 dark:text-white',
  'text-slate-200': 'text-slate-800 dark:text-slate-200',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-500 dark:text-slate-400',
  
  'border-slate-800': 'border-slate-200 dark:border-slate-800',
  'border-slate-700': 'border-slate-300 dark:border-slate-700',
  'border-white/10': 'border-black/10 dark:border-white/10',
  'bg-emerald-500/10': 'bg-emerald-50 dark:bg-emerald-500/10',
  'bg-yellow-500/10': 'bg-yellow-50 dark:bg-yellow-500/10',
  'bg-red-500/10': 'bg-red-50 dark:bg-red-500/10',
  'bg-blue-500/10': 'bg-blue-50 dark:bg-blue-500/10',
  'bg-indigo-500/10': 'bg-indigo-50 dark:bg-indigo-500/10',
  'bg-purple-500/10': 'bg-purple-50 dark:bg-purple-500/10',
};

// Colors to explicitly look out for
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const traverse = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fileExtensions.some(ext => fullPath.endsWith(ext))) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;

      for (const [from, to] of Object.entries(replacements)) {
        // Negative lookbehind for `dark:` or `light:` to avoid double replacing
        const regexStr = '(?<!dark:|light:)\\b' + escapeRegExp(from) + '\\b';
        const regex = new RegExp(regexStr, 'g');
        content = content.replace(regex, to);
      }

      if (original !== content) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
};

traverse(path.join(__dirname, 'src'));
console.log('Migration complete.');
