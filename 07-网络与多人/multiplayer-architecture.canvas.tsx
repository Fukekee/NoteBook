import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
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
  computeDAGLayout,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type LayerId = "session" | "topology" | "authority" | "sync";
type GenreId = "ar-lbs" | "casual" | "fps" | "fighter" | "mmo" | "rts";

const LAYERS: Array<{
  id: LayerId;
  step: string;
  title: string;
  question: string;
  summary: string;
}> = [
  {
    id: "session",
    step: "01",
    title: "会话层",
    question: "人怎么凑到一起？",
    summary: "房间码、大厅、匹配、好友邀请。这一层不负责玩法对错。",
  },
  {
    id: "topology",
    step: "02",
    title: "拓扑层",
    question: "谁当主机？",
    summary: "P2P、Listen Host、Dedicated、Relay。决定延迟、成本和谁能作弊。",
  },
  {
    id: "authority",
    step: "03",
    title: "权威层",
    question: "谁说了算？",
    summary: "客户端权威、服务端权威、或按对象拆分。拓扑选完还不够。",
  },
  {
    id: "sync",
    step: "04",
    title: "同步层",
    question: "状态怎么传？",
    summary: "状态同步、锁步、快照插值。决定手感、带宽和确定性。",
  },
];

const GENRES: Array<{
  id: GenreId;
  label: string;
  topology: string;
  authority: string;
  sync: string;
  session: string;
  why: string;
  avoid: string;
  fit: string;
}> = [
  {
    id: "ar-lbs",
    label: "AR / LBS",
    topology: "Dedicated",
    authority: "服务端权威",
    sync: "状态同步",
    session: "房间码 + 容器",
    why: "GPS / 道具 / 占领点必须防本地篡改；服务端还要跑 Unity 场景才能做碰撞和围栏。",
    avoid: "Listen Host（房主可改坐标）、纯 P2P、把玩法权威放在账号 HTTP 上。",
    fit: "金陵锦谱当前路径",
  },
  {
    id: "casual",
    label: "休闲社交",
    topology: "Host / Relay",
    authority: "Host 权威",
    sync: "状态同步",
    session: "大厅 / 房间码",
    why: "作弊代价低，优先压成本和接入速度。Relay 只解决 NAT，不自动给你权威。",
    avoid: "一上来上 Dedicated 集群；为社交房付按小时的游戏服。",
    fit: "派对、共建、轻对战",
  },
  {
    id: "fps",
    label: "射击",
    topology: "Dedicated",
    authority: "服权威 + 预测",
    sync: "快照插值",
    session: "匹配器",
    why: "命中、伤害、复活不能信客户端。预测是为了手感，不是把权威还给枪口。",
    avoid: "Host 迁移当正式方案；把命中判定放在开枪的那台机器上。",
    fit: "竞技、对战、反外挂",
  },
  {
    id: "fighter",
    label: "格斗 / 平台",
    topology: "P2P / 中继",
    authority: "确定性模拟",
    sync: "锁步 / 回滚",
    session: "大厅 / 直连",
    why: "帧同步比「谁是主机」更重要。输入迟到就回滚重演，而不是插值糊过去。",
    avoid: "用 NGO NetworkVariable 去同步每一帧姿态；人数一多锁步就崩。",
    fit: "2–8 人、强手感",
  },
  {
    id: "mmo",
    label: "MMO",
    topology: "分片 Dedicated",
    authority: "服权威 + AOI",
    sync: "裁剪后状态同步",
    session: "世界服 / 跨服",
    why: "持久世界、经济、背包必须在权威库里。带宽靠「只同步你附近的人」省下来。",
    avoid: "一进程一房间硬扛千人；客户端上报金币。",
    fit: "持久、经济、大规模",
  },
  {
    id: "rts",
    label: "策略 RTS",
    topology: "P2P / 观战服",
    authority: "确定性锁步",
    sync: "只同步输入",
    session: "大厅 + 回放",
    why: "上千单位用状态同步会把带宽打爆。大家跑同一份模拟，只传操作。",
    avoid: "把每个士兵做成 NetworkObject；中途加入不做追帧。",
    fit: "大量实体、可回放",
  },
];

const TOPOLOGY_ROWS = [
  [
    "P2P",
    "玩家直连，无权威主机",
    "延迟最低、成本最低",
    "NAT 失败、作弊、掉线散局",
    "格斗、本地联机、极小房",
  ],
  [
    "Listen Host",
    "一个玩家兼主机",
    "实现快、不用租服",
    "房主延迟优势、房主掉线全挂、房主可改状态",
    "合作、好友房、原型",
  ],
  [
    "Relay",
    "流量经中继，逻辑仍在客户端",
    "穿透 NAT、不用公网 IP",
    "Relay 不是权威；只转发仍可作弊",
    "Listen Host 的补丁，不是第三种玩法架构",
  ],
  [
    "Dedicated",
    "独立进程当权威主机",
    "公平、可校验、可热更规则",
    "成本、运维、冷启动、一房一进程",
    "竞技、LBS、要物理的对局",
  ],
];

const AUTHORITY_ROWS = [
  [
    "客户端权威",
    "本地先改，再广播",
    "手感最好、实现最省",
    "外挂、加速、改坐标",
    "单机感强、无奖惩的展示数据",
  ],
  [
    "Host 权威",
    "房主模拟，其他人跟",
    "比全客户端可信",
    "房主仍是玩家，利益冲突",
    "好友合作、低对抗",
  ],
  [
    "服务端权威",
    "服务器模拟，客户端预测/表现",
    "可校验、可封号、规则统一",
    "要写预测与和解，手感靠调参",
    "比分、伤害、GPS、经济",
  ],
  [
    "拆分权威",
    "不同对象不同主人",
    "灵活：自己走路、服务器判分",
    "所有权边界一乱就不同步",
    "NGO Owner / ServerRpc 的常规拆法",
  ],
];

const SYNC_ROWS = [
  [
    "状态同步",
    "复制位置、血量、开关",
    "直观，适合物体少",
    "实体一多带宽炸",
    "NGO NetworkVariable / RPC",
  ],
  [
    "快照 + 插值",
    "按 tick 拍世界，客户端平滑",
    "射击手感与丢包容忍的主流",
    "要缓冲、要和解、要调插值窗口",
    "FPS、载具",
  ],
  [
    "锁步",
    "只同步输入，各端同模拟",
    "带宽极低、可精确回放",
    "必须确定性；一人卡全员卡",
    "RTS、卡牌、部分格斗",
  ],
  [
    "回滚",
    "先本地演，迟到输入再重算",
    "锁步手感 + 隐藏延迟",
    "实现难，状态必须可倒带",
    "格斗（GGPO 一类）",
  ],
];

const UNITY_ROWS = [
  [
    "NGO + UTP",
    "Client-Server 原语",
    "Dedicated / Host",
    "自建房间或 UOS / Multiplay",
    "要 Unity 物理、已有 NetworkBehaviour",
  ],
  [
    "NGO + Relay",
    "同上，传输改走中继",
    "Listen Host 为主",
    "Relay + Lobby",
    "不想维护端口，能接受 Host 权威",
  ],
  [
    "Photon Fusion / PUN",
    "房间是一等公民",
    "Shared 或 Host",
    "SDK 自带房间",
    "要快上线、能接受重写联机层",
  ],
  [
    "Mirror / FishNet",
    "偏经典 C/S",
    "Host / Dedicated",
    "自建",
    "明确要自己控传输和服务器",
  ],
  [
    "纯 HTTP / 共享逻辑服",
    "无 Unity 运行时",
    "无拓扑，只有 API",
    "账号服兼房间",
    "回合制、排行榜；不要场景物理",
  ],
];

const CHECKLIST = [
  ["防作弊硬需求？", "有奖惩 / GPS / 经济 → Dedicated + 服务端权威", "纯社交展示 → Host 即可"],
  ["服务端要不要 Unity 场景？", "碰撞、Trigger、导航 → 游戏进程当主机", "只算分数几何 → 轻量逻辑服"],
  ["一局几人、几分钟？", "≤16 人短对局 → 一房一进程划算", "持久大世界 → 分片 + AOI"],
  ["谁来凑人？", "房间码 / 匹配不要塞进游戏进程", "会话层挂了不该毁掉已开的局"],
  ["中途加入、重连？", "状态同步天然好做", "锁步必须追帧或禁中途加入"],
  ["沉没成本？", "已有 NGO 行为就别换 Photon 只为房间码", "房间码是会话层问题，不该推翻同步层"],
];

function genreById(id: GenreId) {
  return GENRES.find((g) => g.id === id) ?? GENRES[0];
}

function DecisionDag() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    direction: "horizontal",
    nodeWidth: 128,
    nodeHeight: 44,
    rankGap: 36,
    nodeGap: 20,
    padding: 8,
    nodes: [
      { id: "play" },
      { id: "cheat" },
      { id: "phys" },
      { id: "topo" },
      { id: "auth" },
      { id: "sync" },
      { id: "sdk" },
    ],
    edges: [
      { from: "play", to: "cheat" },
      { from: "play", to: "phys" },
      { from: "cheat", to: "topo" },
      { from: "phys", to: "topo" },
      { from: "topo", to: "auth" },
      { from: "auth", to: "sync" },
      { from: "sync", to: "sdk" },
    ],
  });

  const labels: Record<string, string> = {
    play: "玩法约束",
    cheat: "防作弊",
    phys: "要不要物理",
    topo: "拓扑",
    auth: "权威",
    sync: "同步",
    sdk: "才选 SDK",
  };

  return (
    <svg
      width="100%"
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label="Architecture decision order: gameplay constraints first, SDK last"
    >
      {layout.edges.map((e, i) => (
        <line
          key={`${e.from}-${e.to}-${i}`}
          x1={e.sourceX}
          y1={e.sourceY}
          x2={e.targetX}
          y2={e.targetY}
          stroke={theme.stroke.primary}
          strokeWidth={1}
        />
      ))}
      {layout.nodes.map((n) => {
        const last = n.id === "sdk";
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={128}
              height={44}
              rx={4}
              fill={last ? theme.accent.primary : theme.fill.tertiary}
              stroke={last ? theme.accent.primary : theme.stroke.secondary}
            />
            <text
              x={n.x + 64}
              y={n.y + 27}
              textAnchor="middle"
              fill={last ? theme.text.onAccent : theme.text.primary}
              fontSize={12}
            >
              {labels[n.id]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LayerDetail({ id }: { id: LayerId }) {
  if (id === "session") {
    return (
      <Stack gap={10}>
        <Text>
          会话层只回答「这几个人现在算一局」。它不模拟物理，不裁定比分。
          常见形态：房间码、好友邀请、技能匹配、跨区排队。
        </Text>
        <Text tone="secondary">
          好的拆法：账号 HTTP / 匹配服持有 <Code>roomCode → ip:port</Code>，
          游戏进程只在拿到身份后做 Connection Approval。客户端先轮询 READY，再连 NGO。
        </Text>
        <Text tone="secondary">
          坏的拆法：游戏 Host 自己发房间码、自己当目录服务。Host 一关，别人就找不到房；
          也很难做容量、封禁和按区域调度。
        </Text>
      </Stack>
    );
  }
  if (id === "topology") {
    return (
      <Stack gap={10}>
        <Text>
          拓扑回答「模拟跑在哪台机器」。Relay 经常被误当成第四种玩法架构——它只换传输路径，
          权威仍在 Host 或各客户端。
        </Text>
        <Text tone="secondary">
          Listen Host 适合原型和好友合作。一旦有排行、道具、GPS 围栏，房主既是裁判又是选手，
          校验没有落点。Dedicated 的代价是进程、端口、冷启动，不是协议本身更难。
        </Text>
      </Stack>
    );
  }
  if (id === "authority") {
    return (
      <Stack gap={10}>
        <Text>
          权威回答「冲突时听谁的」。同一局里可以拆：玩家自己的面向用 Owner，
          占领灯笼、房间原点、比分用 Server。
        </Text>
        <Text tone="secondary">
          NGO 里 <Code>IsOwner</Code> / <Code>ServerRpc</Code> / <Code>NetworkVariable</Code>{" "}
          写权限就是权威边界。把 GPS 写成客户端可写的 NetworkVariable，拓扑选 Dedicated 也没用。
        </Text>
      </Stack>
    );
  }
  return (
    <Stack gap={10}>
      <Text>
        同步回答「别人屏幕上怎么跟上」。物体少、规则软，用状态同步。
        物体极多或必须可回放，改锁步。射击要在延迟里保持准星，用快照 + 预测。
      </Text>
      <Text tone="secondary">
        不要用同步模型去补拓扑的洞：锁步防不了改本地模拟的外挂（除非校验哈希），
        Dedicated 也不会自动给你插值。Tick 率、所有权和插值窗口要分开调。
      </Text>
    </Stack>
  );
}

export default function MultiplayerArchitectureCanvas() {
  const theme = useHostTheme();
  const [layer, setLayer] = useCanvasState<LayerId>("layer", "topology");
  const [genre, setGenre] = useCanvasState<GenreId>("genre", "ar-lbs");
  const selected = LAYERS.find((l) => l.id === layer) ?? LAYERS[1];
  const pick = genreById(genre);

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>多人联机：怎么选架构</H1>
        <Text tone="secondary">
          选架构不是先定 NGO / Photon / 自建 UDP，而是把四层决策按顺序叠起来。
          SDK 是最后一步，不是第一步。
        </Text>
      </Stack>

      <DecisionDag />
      <Text size="small" tone="tertiary">
        决策顺序：玩法与约束先于拓扑，拓扑先于权威，权威先于同步，同步先于 SDK。
      </Text>

      <Callout tone="warning" title="最常见的选错方式">
        先被某个 SDK 的「自带房间」吸引，再倒推玩法。房间是会话层功能；
        换 Photon 解决不了「服务端有没有 Unity 物理」，上 Relay 也解决不了「谁能改 GPS」。
      </Callout>

      <H2>四层模型</H2>
      <Text tone="secondary">
        每一层只回答一个问题。混在一起讨论时，会议会在「要不要上 Photon」和「房主掉线怎么办」之间来回跳。
      </Text>
      <Grid columns={4} gap={10}>
        {LAYERS.map((l) => {
          const on = l.id === layer;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLayer(l.id)}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 6,
                border: `1px solid ${on ? theme.accent.primary : theme.stroke.secondary}`,
                background: on ? theme.fill.tertiary : theme.bg.editor,
                cursor: "pointer",
              }}
            >
              <Text size="small" tone="tertiary">
                {l.step}
              </Text>
              <Text weight="semibold">{l.title}</Text>
              <Text size="small" tone="secondary">
                {l.question}
              </Text>
            </button>
          );
        })}
      </Grid>
      <Stack gap={6}>
        <H3>
          {selected.title} · {selected.question}
        </H3>
        <Text italic tone="secondary">
          {selected.summary}
        </Text>
        <LayerDetail id={selected.id} />
      </Stack>

      <Divider />

      <H2>按玩法对照</H2>
      <Text tone="secondary">点一种玩法，看四层通常怎么叠。这是默认组合，不是唯一解。</Text>
      <Row gap={8} wrap>
        {GENRES.map((g) => (
          <span key={g.id}>
            <Pill active={g.id === genre} onClick={() => setGenre(g.id)}>
              {g.label}
            </Pill>
          </span>
        ))}
      </Row>
      <Grid columns={4} gap={12}>
        <Stat value={pick.topology} label="拓扑" />
        <Stat value={pick.authority} label="权威" />
        <Stat value={pick.sync} label="同步" />
        <Stat value={pick.session} label="会话" />
      </Grid>
      <Grid columns="1fr 1fr" gap={16}>
        <Stack gap={6}>
          <H3>为什么这样叠</H3>
          <Text>{pick.why}</Text>
        </Stack>
        <Stack gap={6}>
          <H3>刻意不要选</H3>
          <Text>{pick.avoid}</Text>
          <Text size="small" tone="tertiary">
            典型场景：{pick.fit}
          </Text>
        </Stack>
      </Grid>

      <H2>拓扑对照</H2>
      <Table
        headers={["拓扑", "一句话", "换它的理由", "代价", "适合"]}
        rows={TOPOLOGY_ROWS}
        striped
        rowTone={["neutral", "info", "warning", "success"]}
      />
      <Text size="small" tone="tertiary">
        Relay 单独成行，是为了避免把它和 Dedicated 并列成「两种服务器」。
      </Text>

      <H2>权威对照</H2>
      <Table
        headers={["模型", "谁改世界", "好处", "漏洞", "留给谁"]}
        rows={AUTHORITY_ROWS}
        striped
      />

      <H2>同步对照</H2>
      <Table
        headers={["模型", "传什么", "好处", "代价", "常见落点"]}
        rows={SYNC_ROWS}
        striped
      />

      <H2>Unity 技术栈往哪放</H2>
      <Text tone="secondary">
        把 SDK 映射回四层：左边是同步原语，中间是拓扑能力，右边是会话谁来做。
      </Text>
      <Table
        headers={["栈", "同步原语", "天然拓扑", "会话通常靠", "什么时候该看它"]}
        rows={UNITY_ROWS}
        striped
      />

      <H2>本案怎么叠的</H2>
      <Text>
        金陵锦谱是 AR LBS 短对局，不是 MMO。当前叠法与上表「AR / LBS」一行一致。
      </Text>
      <Grid columns={3} gap={12}>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>会话</Pill>}>
            8080 代理房间
          </CardHeader>
          <CardBody>
            <Text size="small">
              Cookie 会话换 6 位房间码。8080 调 UOS 拉起 Linux 容器，不裁定灯笼和比分。
              客户端轮询 READY 后再连 UDP。
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>拓扑 + 权威</Pill>}>
            NGO Dedicated
          </CardHeader>
          <CardBody>
            <Text size="small">
              一容器一房间。Connection Approval 卡 16 人并核验身份。
              <Code>RoomOrigin</Code>、围栏和玩法对象走服务端权威。
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>同步</Pill>}>
            状态同步
          </CardHeader>
          <CardBody>
            <Text size="small">
              NetworkVariable + RPC，Tick 约 30 Hz。人数上限 16，实体规模吃得消状态复制，
              不需要锁步。
            </Text>
          </CardBody>
        </Card>
      </Grid>
      <Callout tone="info" title="和「换 Photon」提案的关系">
        房间码闲置、一进程单房，是会话层和进程调度问题。TODO 里的方案 A（调度器 +
        端口池）或现在的 UOS 按需容器，都不必推翻 NGO 同步层。方案 C 换 Photon
        会重写 NetworkBehaviour / RPC，沉没成本最高。
      </Callout>

      <H2>选型时逐条问</H2>
      <Table
        headers={["问题", "若是…", "则倾向…"]}
        rows={CHECKLIST}
        striped
      />

      <H2>容易混在一起的三对词</H2>
      <Grid columns={3} gap={16}>
        <Stack gap={6}>
          <H3>Host ≠ Server</H3>
          <Text size="small" tone="secondary">
            NGO 的 Host = 监听的那台机器，常常是玩家。Dedicated Server 也是 Server，
            但没有本地玩家。口里说「上服务器」时，先问有没有真人坐在那台机器上。
          </Text>
        </Stack>
        <Stack gap={6}>
          <H3>Relay ≠ 权威</H3>
          <Text size="small" tone="secondary">
            中继只保证包能到。包的内容仍可由 Host 或客户端伪造。要校验，把模拟搬出玩家进程。
          </Text>
        </Stack>
        <Stack gap={6}>
          <H3>房间 ≠ 对局进程</H3>
          <Text size="small" tone="secondary">
            房间是目录里的一行（谁可以加入、地址是什么）。对局是正在跑的模拟。
            目录挂了可以不散局；进程挂了房间记录还在也进不去。
          </Text>
        </Stack>
      </Grid>

      <Divider />
      <Row gap={8} align="center">
        <Text size="small" tone="tertiary">
          对照本仓库时，从玩法约束往下看，不要从 SDK 广告往上找。
        </Text>
        <Button
          variant="secondary"
          onClick={() => {
            setGenre("ar-lbs");
            setLayer("topology");
          }}
        >
          回到 AR / LBS
        </Button>
      </Row>
    </Stack>
  );
}
