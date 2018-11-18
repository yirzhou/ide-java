function removeUnusedImportActionProvider(editor, range, diagnostic) {
  if (!isUnusedImport(diagnostic)) return

  return {
    getTitle() { return Promise.resolve('Remove unused import') },
    dispose() {},
    apply() {
      const selections = editor.getSelectedBufferRanges()

      editor.setSelectedBufferRange(range)
      editor.deleteLine()

      editor.setSelectedBufferRanges(
        selections.map(s => ({
          start: Object.assign({}, s.start, { row: s.start.row - 1 }),
          end: Object.assign({}, s.end, { row: s.end.row - 1 })
        }))
      );

      return Promise.resolve()
    }
  }
}

function isUnusedImport({ text }) {
  const unusedImportExpr = /The import [a-z0-9_\.]+ is never used/ig
  return unusedImportExpr.test(text)
}

module.exports = {
  provider: removeUnusedImportActionProvider,
  isUnusedImport
}
