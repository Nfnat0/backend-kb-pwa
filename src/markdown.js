import {marked} from 'marked';
import DOMPurify from 'dompurify';
import {esc} from './ui.js';
const renderer=new marked.Renderer();
renderer.code=function({text,lang}){return lang==='mermaid'?`<div class="diagram"><pre class="mermaid">${esc(text)}</pre></div>`:`<pre><code class="language-${esc(lang||'text')}">${esc(text)}</code></pre>`;};
renderer.heading=function({tokens,depth,text}){const match=text.match(/^(\d+)\./);return `<h${depth} ${depth===2&&match?`id="chapter-${match[1]}"`:''}>${this.parser.parseInline(tokens)}</h${depth}>`;};
export function md(text){
 const prepared=text.replace(/::: details (.*)\n([\s\S]*?)\n:::/g,(_,title,body)=>`<details><summary>${title}</summary>\n\n${body}\n\n</details>`).replace(/\]\(\/topics\/([\w-]+)(?:\.html)?(?:#[^)]*)?\)/g,'](#/topic/$1)').replace(/\{#[^}]+\}/g,'');
 return DOMPurify.sanitize(marked.parse(prepared,{renderer}),{ADD_ATTR:['target','rel']});
}
let mermaidPromise;
export async function renderDiagrams(root){
 const nodes=[...root.querySelectorAll('.mermaid:not([data-processed])')].filter(n=>!n.closest('details:not([open])'));if(!nodes.length)return;
 mermaidPromise??=import('mermaid').then(({default:m})=>{m.initialize({startOnLoad:false,theme:'dark',securityLevel:'strict',fontFamily:'system-ui, sans-serif',themeVariables:{darkMode:true,background:'#101c29',primaryColor:'#223653',primaryTextColor:'#edf2fc',lineColor:'#899bb3',fontSize:'15px'},flowchart:{useMaxWidth:true},sequence:{useMaxWidth:true}});return m;});
 const m=await mermaidPromise;
 for(const n of nodes){if(!n.isConnected)continue;try{await m.run({nodes:[n]});}catch(error){if(n.isConnected)throw error;}}
}
