**Set pass**
pass指的是shader下的渲染一遍的流程（从点到像素），一个shader下可能会有多个pass,绘制的时候就会多遍绘制（增加drawCall),比如用于描边的pass
set Pass就代表pass切换，也就是模型材质发生了改动，就会有set pass, set pass 带来的CPU负担比draw call大，因为它影响的是整个渲染管线，整个流程都要重新做，涉及的计算很多
**Draw Call**
代表CPU向GPU发出的一次绘制指令，draw call是在所有数据都准备好后，发出的指令，它不负责上传数据到GPU，draw Call本身大小很小，但是如果drawCall的数量级很大，就会影响CPU的负荷，所以性能优化中我们常常是要去降低drawCall
**Static Batching**
静态合批
怎么使用它：在对应的对象inspector上勾选Batching Static,系统会自动对这些勾选的对象尝试合批
使用前提：对象要是静态的，用相同的材质
本质：把这些不动的对象的顶点合并后一起绘制，减少的是draw call
**Dynamic Batching**
在URP Asset里面勾选，系统会自动对满足条件的对象动态合批
对于会动的使用相同材质的对象，且mesh顶点数不多于300，推荐用，但是，要注意的是它会增大GPU成本，因为它的本质是把这些mesh的顶点全部合并之后统一绘制，所以如果合并后的顶点很大，很占内存。
**SRP Batcher**
项目默认开启，不减少draw call，但是会减少set pass
**Instancing**
要求严格，对于的材质要勾选En
**合mesh**