import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type TabId = "overview" | "modules" | "skills" | "timeline";

export default function WorkSummary() {
  const theme = useHostTheme();
  const [tab, setTab] = useCanvasState<TabId>("tab", "overview");

  return (
    <Stack gap={20} style={{ padding: 20 }}>
      <Stack gap={6}>
        <Text size="small" tone="secondary">
          金陵锦谱 JLMC · 个人工作总结
        </Text>
        <H1>LBS AR 叙事手游 · 系统与玩法程序</H1>
        <Text tone="secondary">
          依据仓库源码、架构文档与 2025.11–2026.09 期间的开发记录整理。角色定位是核心系统与玩法程序：主导定位、联机、剧情管线与 AR 任务接线，并负责把这些系统接到可玩闭环上。账号 / 任务 / 对话所在的 8080 后端不属于本人工作，本文不计入。
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Pill active={tab === "overview"} onClick={() => setTab("overview")}>
          总览
        </Pill>
        <Pill active={tab === "modules"} onClick={() => setTab("modules")}>
          模块与功能
        </Pill>
        <Pill active={tab === "skills"} onClick={() => setTab("skills")}>
          能力与知识
        </Pill>
        <Pill active={tab === "timeline"} onClick={() => setTab("timeline")}>
          技术演进
        </Pill>
      </Row>

      {tab === "overview" ? <Overview /> : null}
      {tab === "modules" ? <Modules /> : null}
      {tab === "skills" ? <Skills /> : null}
      {tab === "timeline" ? <Timeline /> : null}

      <Divider />
      <Text size="small" tone="tertiary">
        来源：Assets/docs/JLMC 项目说明.md、PlayerConnect / Story 源码与文档、Cursor 开发对话（2025.11–2026.09）。数字为当前仓库实现，不等于完整产品设计稿。
      </Text>
      <Text size="small" tone="tertiary" style={{ color: theme.text.quaternary }}>
        若某条能力需要改成「参与」而不是「主导」，按模块表里的职责口径改即可。
      </Text>
    </Stack>
  );
}

function Overview() {
  return (
    <Stack gap={18}>
      <Grid columns={4} gap={12}>
        <Stat value="10 个月" label="持续开发跨度" />
        <Stat value="6" label="主导子系统" tone="info" />
        <Stat value="8 章" label="剧情章节管线" />
        <Stat value="Fusion→NGO" label="联机栈迁移" />
      </Grid>

      <Callout tone="info" title="一句话定位">
        在 Unity 6 上把「现实 GPS → 地理围栏 → 剧情演出 → AR / 联机玩法」做成可运行的产品闭环；同时把联机从 Fusion Host 迁到 NGO 专用服，并评估接入 UOS Multiverse 房间分配。
      </Callout>

      <H2>核心闭环</H2>
      <Text>
        玩家在现实世界行走（或用模拟摇杆），到达指定 GPS 后触发章节。系统先做防抖围栏判定，再按 Chapter → Act → Segment 执行对话、视频、AR 或大厅对战。
      </Text>
      <Table
        headers={["环节", "你做的事", "关键产物"]}
        rows={[
          [
            "定位",
            "统一 GPS / 高德 / Mock 输入，经纬度转世界坐标",
            "LocationManager、GeoProjection、Amap JNI",
          ],
          [
            "围栏与剧情",
            "进入/退出滞后、分支章、本地恢复游标",
            "StoryProgressManager、StorySequencer",
          ],
          [
            "玩法出口",
            "AR 小游戏完成回主场景、大厅对战、奖励入包",
            "ARTask / LobbyBridge / ChapterReward",
          ],
          [
            "联机对战",
            "地理围栏建房、玩家同步、积分点与 AR 挑战",
            "PlayerConnect + UOS 房间链路",
          ],
        ]}
        striped
      />

      <H2>职责边界</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>主导（从方案到落地）</CardHeader>
          <CardBody>
            <Text>
              定位抽象与高德接入、地图投影与原点、NGO 联机与专用服、房间校验 / UOS 评估、剧情状态机、联机 AR 挑战与积分点、主界面任务/地图接线、编辑器异常风暴与场景工程问题。
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>接线与联调（不独占美术/关卡）</CardHeader>
          <CardBody>
            <Text>
              各章 AR 小游戏（染坊、雕版、茶摊、化妆等）多为场景玩法脚本；你负责完成条件、评分、回主场景和 UI 门控。登录页视觉、章节文案、地图模型由其他同学或外部资源提供。8080 上的账号、任务、对话服务不是本人实现。
            </Text>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}

function Modules() {
  return (
    <Stack gap={18}>
      <H2>模块总表</H2>
      <Table
        headers={["模块", "能力", "代表脚本 / 资产"]}
        rows={[
          [
            "定位与地图",
            "真实 GPS、高德 JNI、GCJ-02→WGS84、摇杆/键盘 Mock、等距投影、会话原点、多人网络原点",
            "LocationManager、AmapLocationProvider、GeoProjection、RoomOrigin",
          ],
          [
            "剧情任务",
            "围栏启卷、Chapter/Act/Segment、隐藏任务与梅竹菊分支、视频/对话/AR/Lobby 分发",
            "StoryProgressManager、StorySequencer、StoryChapterData",
          ],
          [
            "多人联机",
            "NGO Client-Server、专用 Linux 服、16 人审批、队伍标识、断线回主场景、重连提示",
            "NGORunnerController、ServerBootstrap、RoomCapacity",
          ],
          [
            "地理房间",
            "regions.json 圆形围栏匹配、GPS 建房校验、后续评估 UOS 按需容器分配",
            "CircleRegionMatcher、RoomFlowService、UosRoomApiClient",
          ],
          [
            "联机玩法",
            "灯笼/道具得分点、AR 挑战成败分流、弹弓与道具效果、结算面板与 HUD",
            "ScorePointManager、ARChallengeService、MatchResultPanel",
          ],
          [
            "AR 交互",
            "SLAM/EasyAR/OpenVINS 放置、灯谜、拾取、道具架、场景叠加进出",
            "SlamARPlacer、PuzzleLibrary、AdditiveSceneController",
          ],
          [
            "主 UI",
            "启卷按钮、任务卷轴、卷轴地图昼夜与罗盘、加载屏、对话结束序列",
            "UIManager、TaskScrollView、ScrollMapCameraController",
          ],
          [
            "进度与奖励",
            "PlayerPrefs 本地游标、背包入包/清纸条、NPC 图鉴、天地人评分",
            "ChapterRewardService、Inventory、NpcCollection",
          ],
        ]}
        striped
        rowTone={[
          "info",
          "info",
          "info",
          "info",
          undefined,
          undefined,
          undefined,
          "success",
        ]}
      />

      <H2>四个最重的子系统</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>从零抽象</Pill>}>
            定位系统
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                用 ILocationDataProvider 把真实 GPS、高德 SDK、键盘、触摸、虚拟摇杆收成同一套 LocationData。LocationToWorldAdapter 再投到 Unity 世界坐标，驱动玩家与围栏。
              </Text>
              <Text tone="secondary">
                补齐了 Android 12+「大致位置」三态检测与引导，避免精确定位没开时 LocalMapOrigin 永远不置位、POI 和剧情全部卡死。
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>架构迁移</Pill>}>
            联机与专用服
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                从 Fusion Host/P2P 迁到 NGO + UnityTransport 直连，落地专用服务器、条件编译隔离 UI、ConnectionApproval 人数上限、队伍头顶标识与房主面板。
              </Text>
              <Text tone="secondary">
                房间从「本机校验 GPS + 单进程假房间码」推进到评估/接入 UOS Multiverse：按需容器、roomCode、READY 状态轮询，以及密钥不能进客户端包的安全约束。
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>产品闭环</Pill>}>
            剧情状态机
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                StorySequencer 按 Segment 类型分发对话、视频、AR 与大厅。Video / Lobby 等本地演出必须在客户端完整走完，不能被跳过。
              </Text>
              <Text tone="secondary">
                用 PlayerPrefs 保存已完成幕与本地游标；AR 段在玩家本地确认通过后才回主场景并推进下一幕。
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>玩法出口</Pill>}>
            联机 AR 挑战
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                regions.json 定义秦淮区圆形区域与得分点；服务端生成灯笼/道具点，玩家占领后进入 AR 挑战。成功与失败走不同销毁和提示路径。
              </Text>
              <Text tone="secondary">
                比赛结束经 MatchResultPanel 回到 StoryLobbyBridge，再推进剧情里的 Lobby 段。
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>联机玩法细节</H2>
      <Text>
        Arena 对战不是「进场景就算完」。从地理围栏匹配、玩家同步、积分点生成，到 AR 挑战和结算回剧情，整条链路在 PlayerConnect 内闭环。
      </Text>
    </Stack>
  );
}

function Skills() {
  return (
    <Stack gap={18}>
      <H2>能独立负责的事情</H2>
      <Grid columns={3} gap={12}>
        <Card>
          <CardHeader>系统设计</CardHeader>
          <CardBody>
            <Text>
              接口隔离（定位 Provider、区域匹配）、ScriptableObject 事件通道、适配器把 GPS / AR 接到同一套游戏循环。能画清联机下「谁是权威、谁只是缓存」。
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>联机与服务端</CardHeader>
          <CardBody>
            <Text>
              理解 Client-Server 与状态权威、NetworkTransform / RPC / ConnectionApproval、专用服无头启动、房间生命周期、以及房间分配与游戏 UDP 是两条连接。
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>移动端落地</CardHeader>
          <CardBody>
            <Text>
              Android 权限与 JNI、坐标系转换、真机 GPS 冷启动、APK 场景裁剪、Input System Only、主线程异常风暴对编辑器帧率的影响。
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <H2>知识面（可写进简历的技术栈）</H2>
      <Table
        headers={["领域", "具体掌握", "项目里怎么用"]}
        rows={[
          [
            "Unity 客户端",
            "Unity 6、URP、新 Input System、Additive Scene、DontDestroyOnLoad 生命周期",
            "主场景 Hub + AR 叠加；禁止遗留 Input Manager",
          ],
          [
            "地理 / LBS",
            "WGS84 / GCJ-02、等距柱状投影、围栏防抖与滞后、指南针与地图朝向",
            "高德定位、Mock 摇杆、剧情启卷、多人出生点",
          ],
          [
            "网络同步",
            "Photon Fusion → Netcode for GameObjects、Host 与 Dedicated Server、输入驱动移动",
            "GPS 目标同步、队伍、积分点、断线回主场景",
          ],
          [
            "云与房间",
            "UOS Multiverse 按需容器、roomCode、READY 轮询、服务端密钥通道",
            "评估并替换本机 TCP 房间校验",
          ],
          [
            "AR / VIO",
            "EasyAR Sense、AR Foundation/ARCore、OpenVINS、自定义 SLAM 放置",
            "识别后放置、相机前方预放置、联机 AR 挑战",
          ],
          [
            "内容管线",
            "ScriptableObject 章节数据、幕与段落配置、Editor 侧章节校验",
            "8 章分支、隐藏任务、梅竹菊支线",
          ],
          [
            "工程与性能",
            "异常风暴防护、场景内嵌材质、合批失败、大地图 Scene 视图卡死",
            "ExceptionStormGuard、MapBase 材质修复、Arena 可见性守卫",
          ],
        ]}
        striped
      />

      <H2>软能力（从实际事故里练出来的）</H2>
      <Stack gap={8}>
        <H3>权威与一致性</H3>
        <Text>
          能区分「本地演出」和「联机房间状态」。GPS 原点、队伍与比赛进度在联机下各有一份权威；处理过 UOS 容器已 Ready 但业务库仍 PENDING、以及客户端伪造 GPS 建房这类问题。
        </Text>
        <H3>联调与排障</H3>
        <Text>
          习惯把一条玩家操作拆成多条独立连接：TCP 建房成功 ≠ NGO UDP 已连上。能用 logcat、UOS errorCode（如 10012 Profile 未应用）做分层定位。
        </Text>
        <H3>文档与交接</H3>
        <Text>
          写过项目总说明、GPS 联机流程、服务器模式指南、UOS 接入说明。知道把中文留给 UI、把 ASCII 留给 Debug.Log，避免 logcat 乱码。
        </Text>
      </Stack>
    </Stack>
  );
}

function Timeline() {
  return (
    <Stack gap={18}>
      <H2>大约十个月的技术演进</H2>
      <Text tone="secondary">
        时间按 Cursor 对话与文档基线排列，用来说明能力是怎么叠上去的，不是精确排期。
      </Text>
      <Table
        headers={["阶段", "你推进的事", "留下的能力"]}
        rows={[
          [
            "2025.11–12",
            "Fusion 联机移动、ScorePoint 生成、GPS 同步、道具效果与 HUD",
            "网络移动权威、联机 AR 得分点",
          ],
          [
            "2026.01–02",
            "位置模拟系统、高德替换 Mapbox、GPS 围栏建房、SLAM / OpenVINS 接入",
            "LBS 抽象、JNI 定位、室内可测",
          ],
          [
            "2026.03–04",
            "章节任务状态机、Lobby 桥接、Fusion→NGO、单机/多人逻辑统一、专用服编译",
            "剧情管线、NGO 专用服",
          ],
          [
            "2026.05–06",
            "任务引导、联机得分门槛、房间管理拆解、隐藏任务与分支",
            "引导/复活、房间生命周期认知",
          ],
          [
            "2026.07–08",
            "队伍与 16 人上限、AR 完成回主场景、主 UI 门控",
            "联机容量与场景进出",
          ],
          [
            "2026.09",
            "UOS Multiverse 评估与密钥通道、Arena 入口、任务卷轴展示",
            "云房间分配、发布前联调",
          ],
        ]}
        striped
        rowTone={["info", "info", "success", undefined, "success", "info"]}
      />

      <Callout tone="neutral" title="简历可压缩成三条成果">
        1）自研 LBS 层：高德 + Mock + 投影 + 围栏，支撑 8 章户外叙事。2）联机从 Fusion Host 迁到 NGO 专用服，并接到地理房间 / UOS 分配。3）剧情状态机：Chapter / Act / Segment 分发对话、视频、AR 与大厅，本地演出完整可跑。
      </Callout>
    </Stack>
  );
}
