### Horizontal Layout Group
**Child Alignment:**
决定当父容器里还有剩余空间时，这一组子物体在父 Rect 里往哪个角落/方向对齐。
**Reverse Arrangement:**
勾选后，子物体在主轴方向(Horizon)上的顺序反转
 **Control Child Size:**
勾选了Layout Group 有权设置子物体宽/高度
**Use Child Scale：**
- 勾选：计算布局尺寸时，把子物体的 `localScale` 也算进去，scale大于1给更大空间
- 不勾选：布局计算时忽略 scale，只按 RectTransform 的宽高算
**Child Force Expand：**
是否把父容器剩余空间均分给 child
勾选了Control Child Size，会拉伸子物体的宽或高来填满剩余空间
没勾选的话，child大小不变，在父物体里“平均摊开”，剩余空间被平均分给child,child布局框变大

### Layout Element
flexible Width和flexible Height的作用是决定child之间在分配父物体的剩余空间时各自的比例，比如把剩余空间分为1比2比3，就是让对应的子物体的flexible 写为1：2：3.当然前提是layoutGroup对应的宽高control size要勾选

`Layout Priority`作用：

> 同一个 UI 物体上多个布局组件都想决定大小时，Priority 更高的那个优先生效。
> 比如 `Layout Element` vs `Text`/`Layout Element` + `Content Size Fitter`

