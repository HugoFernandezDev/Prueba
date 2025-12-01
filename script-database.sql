create table if not exists categorias_menu
(
    id     int auto_increment
        primary key,
    nombre varchar(100)                                 not null,
    status enum ('activo', 'inactivo') default 'activo' null,
    orden  int                         default 99       null,
    constraint nombre
        unique (nombre)
);

create table if not exists menus
(
    id             int auto_increment
        primary key,
    nombre         varchar(100)                                                         not null,
    precio         decimal(10, 2)                                                       not null comment 'Precio fijo del menú completo',
    descripcion    text                                                                 null,
    fecha_creacion timestamp                                default current_timestamp() not null,
    status         enum ('activo', 'inactivo', 'archivado') default 'activo'            not null,
    constraint nombre
        unique (nombre)
);

create table if not exists menu_del_dia_actual
(
    id          int                          default 1        not null
        primary key,
    menu_id     int                                           null comment 'Referencia al menú del día vigente',
    fecha       date                                          not null,
    status      enum ('activo', 'archivado') default 'activo' null,
    precio_fijo decimal(10, 2)               default 0.00     not null,
    constraint menu_id
        unique (menu_id),
    constraint menu_del_dia_actual_ibfk_1
        foreign key (menu_id) references menus (id)
);

create index if not exists idx_nombre
    on menus (nombre);

create table if not exists mesas
(
    id          int auto_increment
        primary key,
    numero_mesa int                                                                  not null,
    capacidad   int                                                                  not null,
    ubicacion   enum ('interior', 'exterior', 'terraza', 'vip') default 'interior'   null,
    status      enum ('disponible', 'ocupada', 'mantenimiento') default 'disponible' null,
    constraint numero_mesa
        unique (numero_mesa)
);

create index if not exists idx_numero
    on mesas (numero_mesa);

create table if not exists platos
(
    id                     int auto_increment
        primary key,
    categoria_id           int                                                                  not null,
    nombre                 varchar(150)                                                         not null,
    descripcion            text                                                                 not null,
    precio                 decimal(10, 2)                                                       not null,
    tiempo_preparacion_min int                                                                  null,
    es_vegetariano         tinyint(1)                                      default 0            null,
    status                 enum ('disponible', 'agotado', 'descontinuado') default 'disponible' null,
    constraint platos_ibfk_1
        foreign key (categoria_id) references categorias_menu (id)
);

create table if not exists detalle_menu_dia
(
    id             int auto_increment
        primary key,
    menu_dia_id    int           not null,
    plato_id       int           not null,
    tipo_plato_dia varchar(50)   not null,
    orden          int default 0 null,
    constraint unique_menu_plato
        unique (menu_dia_id, plato_id),
    constraint detalle_menu_dia_ibfk_1
        foreign key (menu_dia_id) references menu_del_dia_actual (id)
            on delete cascade,
    constraint detalle_menu_dia_ibfk_2
        foreign key (plato_id) references platos (id)
);

create index if not exists plato_id
    on detalle_menu_dia (plato_id);

create table if not exists detalle_menus
(
    id             int auto_increment
        primary key,
    menu_id        int                                             not null,
    plato_id       int                                             not null,
    tipo_plato_dia enum ('entrada', 'segundo', 'postre', 'bebida') not null,
    constraint uk_menu_plato
        unique (menu_id, plato_id),
    constraint detalle_menus_ibfk_1
        foreign key (menu_id) references menus (id)
            on delete cascade,
    constraint detalle_menus_ibfk_2
        foreign key (plato_id) references platos (id)
);

create index if not exists plato_id
    on detalle_menus (plato_id);

create index if not exists idx_categoria
    on platos (categoria_id);

create index if not exists idx_status
    on platos (status);

create table if not exists reclamaciones
(
    id_reclamacion         int auto_increment
        primary key,
    codigo_reclamo         varchar(20)                                not null,
    fecha_registro         timestamp      default current_timestamp() not null,
    estado                 varchar(50)    default 'Pendiente'         not null,
    fecha_respuesta_limite date                                       null,
    tipo_documento         varchar(10)                                not null,
    numero_documento       varchar(20)                                not null,
    nombre_consumidor      varchar(100)                               not null,
    domicilio              varchar(255)                               not null,
    telefono               varchar(20)                                not null,
    email                  varchar(100)                               not null,
    tipo_bien              enum ('producto', 'servicio')              not null,
    monto_reclamado        decimal(10, 2) default 0.00                null,
    descripcion_bien       text                                       not null,
    tipo_solicitud         enum ('reclamo', 'queja')                  not null,
    detalle                text                                       not null,
    pedido_consumidor      text                                       not null,
    detalle_respuesta      text                                       null,
    fecha_respuesta        date                                       null,
    constraint codigo_reclamo
        unique (codigo_reclamo)
);

create index if not exists idx_reclamaciones_documento
    on reclamaciones (numero_documento);

create index if not exists idx_reclamaciones_estado
    on reclamaciones (estado);

create table if not exists usuarios
(
    id        int auto_increment
        primary key,
    nombres   varchar(100)                                                not null,
    apellidos varchar(100)                                                not null,
    email     varchar(100)                                                not null,
    password  varchar(255)                                                not null,
    rol       enum ('cliente', 'admin', 'moza')         default 'cliente' not null,
    status    enum ('activo', 'inactivo', 'suspendido') default 'activo'  null,
    constraint email
        unique (email)
);

create table if not exists pedidos
(
    id           int auto_increment
        primary key,
    mesa_id      int                                                                                                 not null,
    moza_id      int                                                                                                 null,
    fecha_pedido timestamp                                                               default current_timestamp() not null,
    total        decimal(10, 2)                                                                                      not null,
    metodo_pago  enum ('efectivo', 'tarjeta', 'yape', 'plin', 'transferencia')           default 'efectivo'          null,
    status       enum ('abierto', 'en_preparacion', 'listo_pago', 'pagado', 'cancelado') default 'abierto'           null,
    constraint pedidos_ibfk_1
        foreign key (mesa_id) references mesas (id),
    constraint pedidos_ibfk_2
        foreign key (moza_id) references usuarios (id)
            on delete set null
);

create table if not exists detalle_pedidos
(
    id              int auto_increment
        primary key,
    pedido_id       int            not null,
    plato_id        int            null,
    menu_id         int            null,
    cantidad        int default 1  not null,
    precio_unitario decimal(10, 2) not null,
    subtotal        decimal(10, 2) as (`cantidad` * `precio_unitario`) stored,
    notas           varchar(255)   null,
    constraint detalle_pedidos_ibfk_1
        foreign key (pedido_id) references pedidos (id)
            on delete cascade,
    constraint detalle_pedidos_ibfk_2
        foreign key (plato_id) references platos (id),
    constraint detalle_pedidos_ibfk_3
        foreign key (menu_id) references menus (id)
);

create index if not exists idx_pedido
    on detalle_pedidos (pedido_id);

create index if not exists menu_id
    on detalle_pedidos (menu_id);

create index if not exists plato_id
    on detalle_pedidos (plato_id);

create index if not exists idx_fecha
    on pedidos (fecha_pedido);

create index if not exists idx_status
    on pedidos (status);

create index if not exists mesa_id
    on pedidos (mesa_id);

create index if not exists moza_id
    on pedidos (moza_id);

create table if not exists reservas
(
    id               int auto_increment
        primary key,
    mesa_asignada_id int                                                                                           null,
    usuario_id       int                                                                                           null,
    name             varchar(100)                                                                                  not null,
    email            varchar(100)                                                                                  not null,
    guests           int                                                                                           not null,
    reserva_at       datetime                                                                                      not null,
    notas            text                                                                                          null,
    status           enum ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio') default 'pendiente' null,
    constraint reservas_ibfk_1
        foreign key (usuario_id) references usuarios (id)
            on delete set null,
    constraint reservas_ibfk_2
        foreign key (mesa_asignada_id) references mesas (id)
            on delete set null
);

create index if not exists idx_reserva_at
    on reservas (reserva_at);

create index if not exists idx_status
    on reservas (status);

create index if not exists mesa_asignada_id
    on reservas (mesa_asignada_id);

create index if not exists usuario_id
    on reservas (usuario_id);

create index if not exists idx_email
    on usuarios (email);

create index if not exists idx_rol
    on usuarios (rol);

