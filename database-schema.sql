--
-- PostgreSQL database dump
--

\restrict KetbfDEYeCfviYMUwTiCRdy5jZDdhgcSFpqYsUOtdXSXXgqhycbChcakqN00kUl

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_users_provider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_provider AS ENUM (
    'local',
    'google',
    'facebook'
);


ALTER TYPE public.enum_users_provider OWNER TO postgres;

--
-- Name: enum_users_provider_old; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_provider_old AS ENUM (
    'local',
    'google',
    'facebook',
    'microsoft'
);


ALTER TYPE public.enum_users_provider_old OWNER TO postgres;

--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.enum_users_status OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: animal_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_images (
    id integer NOT NULL,
    animal_id integer,
    filename character varying(255) NOT NULL,
    original_name character varying(255),
    file_path character varying(500),
    file_size integer,
    mime_type character varying(100),
    is_primary boolean DEFAULT false,
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_filename character varying(255),
    thumbnail_filename character varying(255)
);


ALTER TABLE public.animal_images OWNER TO postgres;

--
-- Name: animal_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animal_images_id_seq OWNER TO postgres;

--
-- Name: animal_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_images_id_seq OWNED BY public.animal_images.id;


--
-- Name: animal_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_properties (
    id integer NOT NULL,
    animal_id integer,
    property_name character varying(100) NOT NULL,
    property_value text,
    measured_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_properties OWNER TO postgres;

--
-- Name: animal_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animal_properties_id_seq OWNER TO postgres;

--
-- Name: animal_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_properties_id_seq OWNED BY public.animal_properties.id;


--
-- Name: animal_species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_species (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    scientific_name character varying(150),
    description text,
    category character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.animal_species OWNER TO postgres;

--
-- Name: animal_species_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_species_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animal_species_id_seq OWNER TO postgres;

--
-- Name: animal_species_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_species_id_seq OWNED BY public.animal_species.id;


--
-- Name: animal_tag_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_tag_assignments (
    id integer NOT NULL,
    animal_id integer NOT NULL,
    tag_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_tag_assignments OWNER TO postgres;

--
-- Name: animal_tag_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_tag_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animal_tag_assignments_id_seq OWNER TO postgres;

--
-- Name: animal_tag_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_tag_assignments_id_seq OWNED BY public.animal_tag_assignments.id;


--
-- Name: animal_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    color character varying(7) DEFAULT '#1976d2'::character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.animal_tags OWNER TO postgres;

--
-- Name: animal_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animal_tags_id_seq OWNER TO postgres;

--
-- Name: animal_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_tags_id_seq OWNED BY public.animal_tags.id;


--
-- Name: animals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animals (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    species_id integer NOT NULL,
    owner_id integer NOT NULL,
    birth_date date,
    gender character varying(20),
    description text,
    seo_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.animals OWNER TO postgres;

--
-- Name: animals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.animals_id_seq OWNER TO postgres;

--
-- Name: animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animals_id_seq OWNED BY public.animals.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    "userId" integer,
    "sessionId" character varying(255),
    action character varying(255) NOT NULL,
    resource character varying(255) NOT NULL,
    "resourceId" character varying(255),
    "ipAddress" character varying(255),
    "userAgent" text,
    method character varying(255),
    url text,
    "statusCode" integer,
    "responseTime" integer,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_permissions (
    id integer NOT NULL,
    user_group_id integer NOT NULL,
    permission_id integer NOT NULL,
    granted_by integer,
    granted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.group_permissions OWNER TO postgres;

--
-- Name: group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.group_permissions_id_seq OWNER TO postgres;

--
-- Name: group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_permissions_id_seq OWNED BY public.group_permissions.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    description text,
    category character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: COLUMN permissions.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.permissions.name IS 'Human readable permission name';


--
-- Name: COLUMN permissions.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.permissions.code IS 'Unique permission code (e.g., "users.create")';


--
-- Name: COLUMN permissions.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.permissions.description IS 'Detailed description of what this permission allows';


--
-- Name: COLUMN permissions.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.permissions.category IS 'Permission category (e.g., "users", "data", "admin")';


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: species_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_properties (
    id integer NOT NULL,
    species_id integer,
    property_name character varying(100) NOT NULL,
    property_type character varying(50) NOT NULL,
    property_unit character varying(20),
    is_required boolean DEFAULT false,
    default_value text,
    validation_rules jsonb,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.species_properties OWNER TO postgres;

--
-- Name: species_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_properties_id_seq OWNER TO postgres;

--
-- Name: species_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species_properties_id_seq OWNED BY public.species_properties.id;


--
-- Name: statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statistics (
    id integer NOT NULL,
    date date NOT NULL,
    metric character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    value numeric(15,2) NOT NULL,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.statistics OWNER TO postgres;

--
-- Name: statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.statistics_id_seq OWNER TO postgres;

--
-- Name: statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statistics_id_seq OWNED BY public.statistics.id;


--
-- Name: user_group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_group_members (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_group_id integer NOT NULL,
    added_by integer,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_group_members OWNER TO postgres;

--
-- Name: user_group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_group_members_id_seq OWNER TO postgres;

--
-- Name: user_group_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_group_members_id_seq OWNED BY public.user_group_members.id;


--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_groups (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_groups OWNER TO postgres;

--
-- Name: user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_groups_id_seq OWNER TO postgres;

--
-- Name: user_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_groups_id_seq OWNED BY public.user_groups.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "permissionId" integer NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    "grantedBy" integer,
    "grantedAt" timestamp with time zone,
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: COLUMN user_permissions.granted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_permissions.granted IS 'Whether permission is granted (true) or denied (false)';


--
-- Name: COLUMN user_permissions."grantedBy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_permissions."grantedBy" IS 'ID of user who granted this permission';


--
-- Name: COLUMN user_permissions."grantedAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_permissions."grantedAt" IS 'When permission was granted';


--
-- Name: COLUMN user_permissions."expiresAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_permissions."expiresAt" IS 'When permission expires (null = never expires)';


--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_permissions_id_seq OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    phone character varying(255),
    company character varying(255),
    role character varying(255) NOT NULL,
    status public.enum_users_status DEFAULT 'active'::public.enum_users_status NOT NULL,
    provider public.enum_users_provider DEFAULT 'local'::public.enum_users_provider NOT NULL,
    provider_id character varying(255),
    avatar text,
    refresh_token text,
    last_login_at timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    address text,
    viber character varying(255),
    whatsapp character varying(255),
    signal character varying(255),
    facebook character varying(255),
    instagram character varying(255),
    twitter character varying(255),
    linkedin character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: animal_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_images ALTER COLUMN id SET DEFAULT nextval('public.animal_images_id_seq'::regclass);


--
-- Name: animal_properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_properties ALTER COLUMN id SET DEFAULT nextval('public.animal_properties_id_seq'::regclass);


--
-- Name: animal_species id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_species ALTER COLUMN id SET DEFAULT nextval('public.animal_species_id_seq'::regclass);


--
-- Name: animal_tag_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tag_assignments ALTER COLUMN id SET DEFAULT nextval('public.animal_tag_assignments_id_seq'::regclass);


--
-- Name: animal_tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tags ALTER COLUMN id SET DEFAULT nextval('public.animal_tags_id_seq'::regclass);


--
-- Name: animals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals ALTER COLUMN id SET DEFAULT nextval('public.animals_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: group_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_permissions ALTER COLUMN id SET DEFAULT nextval('public.group_permissions_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: species_properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_properties ALTER COLUMN id SET DEFAULT nextval('public.species_properties_id_seq'::regclass);


--
-- Name: statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics ALTER COLUMN id SET DEFAULT nextval('public.statistics_id_seq'::regclass);


--
-- Name: user_group_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_members ALTER COLUMN id SET DEFAULT nextval('public.user_group_members_id_seq'::regclass);


--
-- Name: user_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups ALTER COLUMN id SET DEFAULT nextval('public.user_groups_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: animal_images animal_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_images
    ADD CONSTRAINT animal_images_pkey PRIMARY KEY (id);


--
-- Name: animal_properties animal_properties_animal_id_property_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_properties
    ADD CONSTRAINT animal_properties_animal_id_property_name_key UNIQUE (animal_id, property_name);


--
-- Name: animal_properties animal_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_properties
    ADD CONSTRAINT animal_properties_pkey PRIMARY KEY (id);


--
-- Name: animal_species animal_species_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_species
    ADD CONSTRAINT animal_species_name_key UNIQUE (name);


--
-- Name: animal_species animal_species_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_species
    ADD CONSTRAINT animal_species_pkey PRIMARY KEY (id);


--
-- Name: animal_tag_assignments animal_tag_assignments_animal_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tag_assignments
    ADD CONSTRAINT animal_tag_assignments_animal_id_tag_id_key UNIQUE (animal_id, tag_id);


--
-- Name: animal_tag_assignments animal_tag_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tag_assignments
    ADD CONSTRAINT animal_tag_assignments_pkey PRIMARY KEY (id);


--
-- Name: animal_tags animal_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tags
    ADD CONSTRAINT animal_tags_name_key UNIQUE (name);


--
-- Name: animal_tags animal_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_tags
    ADD CONSTRAINT animal_tags_pkey PRIMARY KEY (id);


--
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- Name: animals animals_seo_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_seo_url_key UNIQUE (seo_url);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: group_permissions group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_pkey PRIMARY KEY (id);


--
-- Name: group_permissions group_permissions_user_group_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_user_group_id_permission_id_key UNIQUE (user_group_id, permission_id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: species_properties species_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_properties
    ADD CONSTRAINT species_properties_pkey PRIMARY KEY (id);


--
-- Name: species_properties species_properties_species_id_property_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_properties
    ADD CONSTRAINT species_properties_species_id_property_name_key UNIQUE (species_id, property_name);


--
-- Name: statistics statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_pkey PRIMARY KEY (id);


--
-- Name: user_group_members user_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_members
    ADD CONSTRAINT user_group_members_pkey PRIMARY KEY (id);


--
-- Name: user_group_members user_group_members_user_id_user_group_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_members
    ADD CONSTRAINT user_group_members_user_id_user_group_id_key UNIQUE (user_id, user_group_id);


--
-- Name: user_groups user_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_name_key UNIQUE (name);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_userId_permissionId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "user_permissions_userId_permissionId_key" UNIQUE ("userId", "permissionId");


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: animal_tag_assignments_animal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX animal_tag_assignments_animal_id ON public.animal_tag_assignments USING btree (animal_id);


--
-- Name: animal_tag_assignments_animal_id_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX animal_tag_assignments_animal_id_tag_id ON public.animal_tag_assignments USING btree (animal_id, tag_id);


--
-- Name: animal_tag_assignments_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX animal_tag_assignments_tag_id ON public.animal_tag_assignments USING btree (tag_id);


--
-- Name: animal_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX animal_tags_name ON public.animal_tags USING btree (name);


--
-- Name: audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_at ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_ip_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_ip_address ON public.audit_logs USING btree ("ipAddress");


--
-- Name: audit_logs_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_resource ON public.audit_logs USING btree (resource);


--
-- Name: audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id ON public.audit_logs USING btree ("userId");


--
-- Name: idx_animal_images_animal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_images_animal_id ON public.animal_images USING btree (animal_id);


--
-- Name: idx_animal_properties_animal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_properties_animal_id ON public.animal_properties USING btree (animal_id);


--
-- Name: idx_animal_tag_assignments_animal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_tag_assignments_animal_id ON public.animal_tag_assignments USING btree (animal_id);


--
-- Name: idx_animal_tag_assignments_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_tag_assignments_tag_id ON public.animal_tag_assignments USING btree (tag_id);


--
-- Name: idx_species_properties_species_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_species_properties_species_id ON public.species_properties USING btree (species_id);


--
-- Name: statistics_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX statistics_category ON public.statistics USING btree (category);


--
-- Name: statistics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX statistics_date ON public.statistics USING btree (date);


--
-- Name: statistics_date_metric_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX statistics_date_metric_category ON public.statistics USING btree (date, metric, category);


--
-- Name: statistics_metric; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX statistics_metric ON public.statistics USING btree (metric);


--
-- Name: unique_group_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_group_name ON public.user_groups USING btree (name);


--
-- Name: unique_group_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_group_permission ON public.group_permissions USING btree (user_group_id, permission_id);


--
-- Name: unique_user_group_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_group_member ON public.user_group_members USING btree (user_id, user_group_id);


--
-- Name: unique_user_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_permission ON public.user_permissions USING btree ("userId", "permissionId");


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- Name: users_provider_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_provider_provider_id ON public.users USING btree (provider, provider_id) WHERE (provider <> 'local'::public.enum_users_provider);


--
-- Name: animal_tag_assignments update_animal_tag_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_animal_tag_assignments_updated_at BEFORE UPDATE ON public.animal_tag_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: animals animals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: animals animals_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: animals animals_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.animal_species(id);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: group_permissions group_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: group_permissions group_permissions_user_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_permissions
    ADD CONSTRAINT group_permissions_user_group_id_fkey FOREIGN KEY (user_group_id) REFERENCES public.user_groups(id) ON DELETE CASCADE;


--
-- Name: user_group_members user_group_members_user_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_members
    ADD CONSTRAINT user_group_members_user_group_id_fkey FOREIGN KEY (user_group_id) REFERENCES public.user_groups(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KetbfDEYeCfviYMUwTiCRdy5jZDdhgcSFpqYsUOtdXSXXgqhycbChcakqN00kUl

