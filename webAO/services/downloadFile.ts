const downloadFile = (content: string, filename: string) => {
  const a = document.createElement('a');
  const file = new Blob([content], {type: 'text'});
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();
}
export default downloadFile