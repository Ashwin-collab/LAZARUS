const fs = require('fs');
const path = 'd:/LAZARUS/css/style.css';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  { old: '#2563eb', new: '#0ea5e9' },
  { old: '#1d4ed8', new: '#0284c7' },
  { old: '#3b82f6', new: '#38bdf8' },
  { old: '#93c5fd', new: '#7dd3fc' },
  { old: '#bfdbfe', new: '#bae6fd' },
  { old: '#1e3a8a', new: '#0c4a6e' },
  { old: '37,99,235', new: '14,165,233' },
  { old: '59,130,246', new: '56,189,248' }
];

replacements.forEach(r => {
  content = content.split(r.old).join(r.new);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Colors successfully updated to light blue.');
