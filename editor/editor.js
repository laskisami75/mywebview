import '../ext.js'

$('#btnReplace').onclick = e => {
  $('[role=dialog]').toggleAttribute('hidden', false)
}
$('#btnClose').onclick = e => {
  $('[role=dialog]').toggleAttribute('hidden', true)
}
$('#btnOk').onclick = e => {
  $('[role=dialog]').toggleAttribute('hidden', true)
  
  const text = $('#editor').value
  const pattern = $('#pattern').textContent
  const replacement = $('#replacement').textContent
  const patternMatch = pattern.match(/^\/(.+)\/([gmsi]+)$/)
  if (!patternMatch)
    $('#editor').value = text.replaceAll(pattern, replacement)
  else
    $('#editor').value = text.replace(regex(patternMatch[2])`${patternMatch[1]}`, replacement)
}