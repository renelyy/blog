# Ajax 与 JSONP

[← 返回索引](../index.md)

> 手写 ajax/jsonp

---

## 实现ajax

> 来源：`profile/JavaScript/JavaScript手写题/ajax与jsonp/实现ajax.js`

```javascript
function ajax({ url = null, method = 'GET', dataType = 'JSON', async = true }) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open(method, url, async)
    xhr.responseType = dataType
    xhr.onreadystatechange = () => {
      if (!/^[23]\d{2}$/.test(xhr.status)) return
      if (xhr.readyState === 4) {
        let result = xhr.responseText
        resolve(result)
      }
    }
    xhr.onerror = err => {
      reject(err)
    }
    xhr.send()
  })
}
```

---

## 实现jsonp

> 来源：`profile/JavaScript/JavaScript手写题/ajax与jsonp/实现jsonp.js`

```javascript
const jsonp = ({ url, params, callbackName }) => {
  const generateUrl = () => {
    let dataSrc = ''
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        dataSrc += `${key}=${params[key]}&`
      }
    }
    dataSrc += `callback=${callbackName}`
    return `${url}?${dataSrc}`
  }
  return new Promise((resolve, reject) => {
    const scriptEle = document.createElement('script')
    scriptEle.src = generateUrl()
    document.body.appendChild(scriptEle)
    window[callbackName] = data => {
      resolve(data)
      document.body.removeChild(scriptEle)
    }
  })
}

// usage
jsonp({
  url: '',
  params: {},
  callbackName: 'jsonpCallback',
}).then(res => {
  // get server data res
})
```

---

