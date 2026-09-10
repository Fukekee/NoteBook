导入的动画居然是readOnly,原因很可能是这个动画是从 FBX 模型文件里导入的，Unity 默认不允许直接修改 FBX 内嵌的动画，所以是 ReadOnly。
——解决方法是：把它复制一份独立的##  .anim 文件出来，可以自由编辑（包括添加 Animation Event）