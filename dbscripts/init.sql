create type users_role_enum as enum('owner', 'admin', 'translator');
create type task_status_enum as enum('pending', 'locked', 'proofreaded', 'released');

CREATE TABLE public.users (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	email varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" users_role_enum NOT NULL,
	CONSTRAINT "PK_tbl_users" PRIMARY KEY (id)
);

INSERT INTO public.users ("createdAt","updatedAt",email,"password","role") VALUES
('2021-08-03 07:39:10.208','2021-08-03 07:39:10.208','admin01@test.com','$2b$10$o3teqwo97HkfqXoj5Dh9iOST53iUaZIG6jc7KD3jyjeZW1u.6Ve7q','owner')
,('2021-08-03 07:39:26.811','2021-08-03 07:39:26.811','translator01@test.com','$2b$10$eXxZ0gCRXnnTSkxbGdXbqO/6Rz3s/rvBytDMAt7JhEbMOP9RWTf22','translator')
,('2021-08-03 07:39:29.958','2021-08-03 07:39:29.958','translator02@test.com','$2b$10$.2LkoMIKvZxJn/h4C7U/leYEpUGEWxa54R69JFIVrRB/tHJbNfFfS','translator')
,('2021-08-03 07:39:32.615','2021-08-03 07:39:32.615','translator03@test.com','$2b$10$gSEv7KWwzj4QDdkTRxYvUe4SvYVGZGiXQGgCCr4trj6AMb/v2nlXu','translator')
,('2021-08-03 07:39:35.024','2021-08-03 07:39:35.024','translator04@test.com','$2b$10$PCzY2GA9Fzigf1v35vnoF.5oO2m4c3AGhuBWGWg6O3xRMIWlX24xG','translator')
,('2021-08-03 07:39:41.299','2021-08-03 07:39:41.299','translator06@test.com','$2b$10$xssmyfYNiqSThNjlSh5Ug.eTn2xJvwM/.MxT13PG7QK2OwwaNrY1O','translator')
,('2021-08-03 07:39:37.457','2021-08-03 07:39:37.457','translator05@test.com','$2b$10$OOea9NZpZkIGTZ.Yt3KEtekAmZK2W5pxJB0C4JWrIdCEDMlejW3Qe','translator')
;

CREATE TABLE public.tasks (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	"name" varchar NOT NULL,
	saved_on timestamp NULL DEFAULT now(),
	status task_status_enum NOT NULL,
	updated_by varchar,
	CONSTRAINT "PK_tbl_tasks" PRIMARY KEY (id)
);

CREATE TABLE public.translations (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	"keyName" varchar NOT NULL,
	"taskId" int4 NULL,
	CONSTRAINT "PK_tbl_translations" PRIMARY KEY (id)
);


-- public.translations foreign keys

ALTER TABLE public.translations ADD CONSTRAINT "FK_translations_tasks" FOREIGN KEY ("taskId") REFERENCES tasks(id);


CREATE TABLE public.languages (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	en varchar NULL,
	fr varchar NULL,
	zh varchar NULL,
	pt varchar NULL,
	es varchar NULL,
	ar varchar NULL,
	ko varchar NULL,
	"translationId" int4 NULL,
	CONSTRAINT "PK_tbl_languages" PRIMARY KEY (id),
	CONSTRAINT "UQ_tbl_languages" UNIQUE ("translationId")
);


-- public.languages foreign keys

ALTER TABLE public.languages ADD CONSTRAINT "FK_languages_translations" FOREIGN KEY ("translationId") REFERENCES translations(id);


CREATE TABLE public.assignees (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	assigned_language varchar NOT NULL,
	"userId" int4 NULL,
	"taskId" int4 NULL,
	CONSTRAINT "PK_8abd9183a32f7dd03164790b8c7" PRIMARY KEY (id)
);


-- public.assignees foreign keys

ALTER TABLE public.assignees ADD CONSTRAINT "FK_assignees_tasks" FOREIGN KEY ("taskId") REFERENCES tasks(id);
ALTER TABLE public.assignees ADD CONSTRAINT "FK_assignees_users" FOREIGN KEY ("userId") REFERENCES users(id);


CREATE TABLE public.projects (
	id serial NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	"name" varchar NOT NULL,
	CONSTRAINT "PK_tbl_projects" PRIMARY KEY (id)
);