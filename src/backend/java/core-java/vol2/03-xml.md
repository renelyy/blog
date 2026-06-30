# 第 3 章：XML

[← 卷 II 目录](../index)

> 原书 Chapter 3 — XML

---

## 企业何时接触 XML

| 场景 | 示例 |
|------|------|
| **MyBatis Mapper** | `UserMapper.xml` |
| Spring 老项目 | `applicationContext.xml` |
| **Maven** | `pom.xml` |
| SOAP / 政企对接 | WSDL、报文 |
| 配置导出 | 工作流 BPMN |

现代 REST 以 **JSON** 为主；XML 仍是 Java 企业栈**必会**技能。

---

## ⭐ XML 基础结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <database>
    <url>jdbc:mysql://localhost/demo</url>
    <pool size="20"/>
  </database>
</configuration>
```

- 元素、属性、文本、CDATA
- 命名空间 `xmlns` — Spring、MyBatis 常用

---

## ⭐ DOM vs SAX vs StAX

| 方式 | 内存 | 访问模式 | 适用 |
|------|------|----------|------|
| **DOM** | 整树加载 | 随机访问、可改 | 小文件配置 |
| **SAX** | 流式 | 事件驱动只读 | 大文件解析 |
| **StAX** | 流式 | 拉式读写 | 读写灵活 |

---

## ⭐ DOM 解析（javax.xml）

```java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
// XXE 防护 — 生产必配
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(Files.newInputStream(path));
Element root = doc.getDocumentElement();

NodeList nodes = doc.getElementsByTagName("url");
String url = nodes.item(0).getTextContent();
```

**XXE 漏洞：** 解析不可信 XML 必须禁用外部实体，否则读服务器文件、SSRF。

---

## ⭐ XPath 定位

```java
XPath xpath = XPathFactory.newInstance().newXPath();
String url = xpath.evaluate("/configuration/database/url", doc);
NodeList pools = (NodeList) xpath.evaluate("//pool", doc, XPathConstants.NODESET);
```

复杂配置抽取、测试断言会用。

---

## ⭐ StAX 流式读

```java
XMLInputFactory factory = XMLInputFactory.newInstance();
factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
try (XMLStreamReader reader = factory.createXMLStreamReader(in)) {
  while (reader.hasNext()) {
    int event = reader.next();
    if (event == XMLStreamConstants.START_ELEMENT
        && "url".equals(reader.getLocalName())) {
      String url = reader.getElementText();
    }
  }
}
```

大 XML 报文、导入文件优先 StAX/SAX。

---

## 📌 生成 XML

```java
Document doc = builder.newDocument();
Element root = doc.createElement("order");
doc.appendChild(root);
Element id = doc.createElement("id");
id.setTextContent("1001");
root.appendChild(id);

Transformer transformer = TransformerFactory.newInstance().newTransformer();
transformer.transform(new DOMSource(doc), new StreamResult(out));
```

StAX `XMLStreamWriter` 更适合流式写大文档。

---

## 📌 JAXB / Jakarta XML Binding

```java
@XmlRootElement
public class Order {
  @XmlElement private Long id;
  @XmlElement private String status;
}

JakartaXmlBindContext ctx = JakartaXmlBindContext.newInstance(Order.class);
Order order = (Order) ctx.createUnmarshaller().unmarshal(in);
ctx.createMarshaller().marshal(order, out);
```

SOAP、遗留集成；新 REST 用 Jackson XML 模块或 JSON。

---

## 📌 XML vs JSON（API 选型）

| | XML | JSON |
|---|-----|------|
|  verbosity | 高 | 低 |
|  Schema | XSD | JSON Schema / OpenAPI |
|  Java 生态 | 成熟 | **REST 默认** |
|  注释 | 有 | 无 |

MyBatis 映射是**自定义 XML 方言**，不是业务里手写 DOM。见 [MyBatis XML 映射](../../../mybatis/04-xml-mapper)。

---

## ⚠️ 安全清单

- 禁用 DTD / 外部实体（XXE）
- 不信任的 XML 不做 XPath 扩展函数
- 大文件勿 DOM 一次加载

---

## 本章小结

- 会读 pom、MyBatis XML、简单配置即可
- DOM 小文件 + XPath；大文件 StAX
- XXE 防护是安全红线

---

## 下一步

- [第 4 章：网络编程](./04-networking)
