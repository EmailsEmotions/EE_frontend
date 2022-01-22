export function logout(token: string) {
  // Request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:8080/api/auth/logout');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', token);
  xhr.send(null);

  unAuthorized();
}

export function unAuthorized() {
  document.body.innerHTML =
    '<p class="unauthorized">Please authorize via the extension (review button)</p>';
}
