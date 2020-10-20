create database PontAPI;
use PontAPI;

create table ver_version(
	ver_id int auto_increment,
    ver_nom varchar(10) not null,
    constraint pk_version primary key(ver_id)
);

create table ser_service(
	ser_id int auto_increment,
    ser_nom varchar(50) not null,
    constraint pk_service primary key(ser_id)
);

create table app_appel(
	app_id int auto_increment,
    app_id_service int not null,
    app_debut datetime not null,
    app_fin datetime null,
    app_succes int null,
    constraint pk_appel primary key(app_id),
    constraint fk_appel_service foreign key(app_id_service) references ser_service(ser_id)
		on delete cascade on update cascade
);

create table doc_document(
	doc_id int auto_increment,
    doc_id_appel int not null,
    doc_id_entite int not null,
    doc_id_document varchar(50) not null,
    doc_debut datetime not null,
    doc_fin datetime null,
    suc_succes int null,
    constraint pk_document primary key(doc_id),
    constraint fk_document_id_appel foreign key(doc_id_appel)references app_appel(app_id)
		on delete cascade on update cascade
);

create table fia_fichier_alfresco(
	fia_id int auto_increment,
    fia_id_document int not null,
    fia_type varchar(50) not null,
    fia_id_alfresco varchar(50) not null,
    constraint pk_fichier_alfresco primary key(fia_id),
    constraint fk_fichier_alfresco_document foreign key(fia_id_document)references doc_document(doc_id)
		on delete cascade on update cascade
);

create table cro_cron(
	cro_id int auto_increment,
    cro_id_service int not null,
    cro_frequence varchar(50) not null,
    constraint pk_cron primary key(cro_id),
    constraint fk_cron_appel foreign key(cro_id_service)references ser_service(ser_id)
		on delete cascade on update cascade
);

insert into ver_version(ver_nom)values('1.0.0');

select * from ser_service;
select * from app_appel;
select * from doc_document;
select * from fia_fichier_alfresco;
select * from cro_cron;

SET SQL_SAFE_UPDATES = 0;
update fia_fichier_alfresco set fia_type = 'piece signee marche' where fia_id is not null;
update cro_cron set cro_frequence = '0 */1 * * * *';

drop table fia_fichier_alfresco;
drop table doc_document;
drop table app_appel;
drop table ser_service;
drop table ver_version;
drop table cro_cron;
