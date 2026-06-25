# PEL 分之一粉运后台

静态管理端原型，按 `CG11038—PEL分之一粉运小程序.xlsx` 的 `B端后台` 能力拆分页面。

登录账号：

- 账号：admin
- 密码：123456

页面对应关系：

- `pages/page0_user.html`：用户中心
- `pages/page1_banner.html`：配置中心
- `pages/page2_club.html`：俱乐部中心
- `pages/page3_task.html`：任务大厅配置
- `pages/page6_activity.html`：活动中心
- `pages/page7_product.html`：积分兑换商城
- `pages/page5_import.html`：批量导入
- `pages/page8_review.html`：审核中心
- `pages/page9_feedback.html`：工单管理 & 客服承接
- `pages/page10_message.html`：消息推送/通知管理

核心能力数据集中维护在 `assets/js/admin-data.js`，页面渲染逻辑在 `assets/js/common.js`。
