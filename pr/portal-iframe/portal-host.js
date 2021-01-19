for (portal of document.getElementsByTagName('portal')) {
  portal.onclick = (event) => {
    event.target.activate();
  };
}
