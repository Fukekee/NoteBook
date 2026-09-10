•	Vector2 和 Vector3 都是 UnityEngine 命名空间下的结构体（struct），支持加减乘除、归一化、插值等常用向量运算。
•	可以通过 new Vector2(x, y) 或 new Vector3(x, y, z) 创建实例。
#### 向量加减
`Vector2 a = new Vector2(1, 2);`
`Vector2 b = new Vector2(3, 4);`
`Vector2 sum = a + b;      // (4, 6)`
`Vector2 diff = a - b;     // (-2, -2)`

`Vector3 c = new Vector3(1, 2, 3);`
`Vector3 d = new Vector3(4, 5, 6);`
`Vector3 sum3 = c + d;     // (5, 7, 9)`
`Vector3 diff3 = c - d;    // (-3, -3, -3)`
#### 数乘与数除
`Vector2 scaled = a * 2f;      // (2, 4)`
`Vector3 scaled3 = c * 0.5f;   // (0.5, 1, 1.5)`
#### 点乘（Dot）
==不太懂==
`float dot2 = Vector2.Dot(a, b);`
`float dot3 = Vector3.Dot(c, d);`
#### 叉乘（仅 Vector3）
==不太懂==
`Vector3 cross = Vector3.Cross(c, d);`
#### 归一化（单位向量）
`Vector2 norm2 = a.normalized;`
`Vector3 norm3 = c.normalized;`
#### 长度（模长）
`float len2 = a.magnitude;`
`float len3 = c.magnitude;`
#### 距离
`float dist2 = Vector2.Distance(a, b);`
`float dist3 = Vector3.Distance(c, d);`
#### 插值
`Vector2 lerp2 = Vector2.Lerp(a, b, 0.5f);`
`Vector3 lerp3 = Vector3.Lerp(c, d, 0.5f);`
