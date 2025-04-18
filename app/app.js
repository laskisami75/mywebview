import '../ext.js'

$('#btnMsg').onclick = e => {
  androidAppProxy.showMessage('Test message')
}