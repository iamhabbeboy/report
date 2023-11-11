var textArea: any

export const isIOS = () => {
  return navigator.userAgent.match(/ipad|iphone/i);
}

function createTextArea(text: string) {
  textArea = document.createElement("textArea");
  textArea.value = text;
  document.body.appendChild(textArea);
}

function selectText() {
  var range, selection: any;

  if (isIOS()) {
    range = document.createRange();
    range.selectNodeContents(textArea);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, 999999);
  } else {
    textArea.select();
  }
}

function copyToClipboard() {
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export const copyForIOS = (text: string) => {
  createTextArea(text);
  selectText();
  copyToClipboard();
};
