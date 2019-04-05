export default function (babel) {
  const t = babel.types;
  
  const isRamdaImport = (node) =>
    t.isStringLiteral(node) && node.value === 'ramda';
  
  const isNamedImport = (node) => 
    node.specifiers.length > 0 && t.isImportSpecifier(node.specifiers[0])
  
  const isNamespaceImport = (node) => 
    t.isImportNamespaceSpecifier(node)
  
  const createRamdaImport = (name) => {
    return t.ImportDeclaration([t.importDefaultSpecifier(t.identifier(name))], t.stringLiteral(`ramda/src/${name}`))
  }
  
  return {
    name: "ast-transform", // not required
    visitor: {
      Program: {
      	enter(path, {file}) {
      		
    	},
        exit(path, { file }) {
          const ramda = file.get('ramda');
          if(!ramda) return;
          const name = ramda.node.specifiers[0].local.name;
          let ramdaImport = [];
          path.scope.getBinding(name).referencePaths.forEach(p => {
			const ramdaNamedImport = p.parent.property.name;
            p.parentPath.replaceWith(t.Identifier(ramdaNamedImport))
            if(ramdaImport.some(i => i === ramdaNamedImport)) return;
            ramda.insertAfter(createRamdaImport(ramdaNamedImport))
            ramdaImport.push(ramdaNamedImport);
          });
          ramda.remove();
        }
      },
      ImportDeclaration(path, { file }) {
        if(!isRamdaImport(path.node.source)) return;

        if(isNamedImport(path.node)) {
			path.node.specifiers.forEach(s => {
              path.insertAfter(createRamdaImport(s.imported.name))
            });
          path.remove();
        } else if (isNamespaceImport(path.node.specifiers[0])) {
          file.set('ramda', path);
        }   
      }
    }
  };



}
