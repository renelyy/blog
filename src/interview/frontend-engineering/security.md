# 安全性

## XSS

1. 核心概念：什么是 XSS 攻击？

XSS，全称是`跨站脚本攻击 Cross Site Script`。顾名思义，就是攻击者将恶意的脚本代码“跨站”注入到受信任的网站上，当其他用户访问该网站时，恶意脚本就会在他们的浏览器中执行。

2. XSS 攻击的原理是什么？

核心原理在于：**网站对用户输入的内容没有进行充分的过滤和转义，就将其作为网页的一部分显示给了其他用户。**

3. XSS 攻击的主要类型

- 反射型 XSS 攻击：非持久化，恶意脚本“反射”在 URL 里，需要用户主动点击这个恶意链接才能触发。
- 存储型 XSS 攻击：持久化，最危险的一种。恶意脚本被永久地存储在目标服务器的数据库、评论区、用户资料等地方。每个访问该页面的用户都会中招。
- DOM 型 XSS 攻击：整个攻击过程在客户端完成，不涉及服务器。漏洞出在前端 JavaScript 代码中。

4. 如何防范 XSS 攻击？

- 对用户输入的内容进行严格的过滤，只允许合法的内容输入
- 对用户输入的内容进行转义，将特殊字符转换为 HTML 实体
- 谨慎使用 innerHTML、document.write() 等方法，避免直接将用户输入的内容插入到网页中
- 使用 Content Security Policy (CSP) 策略，限制网页加载其他域的脚本
- 使用 HttpOnly Cookie，这样 JavaScript 就无法通过 document.cookie 获取 Cookie，防止 XSS 攻击窃取 Cookie
- 使用 HTTPS 协议，防止中间人攻击

## CSRF

1. 核心概念：什么是 CSRF 攻击？

CSRF，全称是`跨站请求伪造 Cross-Site Request Forgery`。攻击者诱导受害者进入第三方网站，利用受害者的登录状态发起恶意请求。

2. CSRF 攻击的原理是什么？

核心原理在于：**攻击者诱导受害者进入第三方网站，利用受害者的登录状态发起恶意请求。**

3. 如何防范 CSRF 攻击？

- 使用 CSRF Token：在表单提交时，服务器生成一个 CSRF Token，并将其放在表单中，同时将 CSRF Token 存储在服务器的 Session 中。当表单提交时，服务器验证表单中的 CSRF Token 是否与 Session 中的 CSRF Token 一致，如果一致则允许请求，否则拒绝请求。
- 使用 SameSite Cookie 属性：SameSite Cookie 属性可以防止跨站请求携带 Cookie，从而防止 CSRF 攻击。
