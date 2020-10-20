delimiter !
create function f_ajouter_service(nom_service varchar(50))
returns int
begin
	if((select ser_id from ser_service where ser_nom = nom_service) is null) then
		insert into ser_service(ser_nom)values(nom_service);
        return last_insert_id();
	else
		return (select ser_id from ser_service where ser_nom = nom_service);
	end if;
end !
delimiter ;

delimiter !
create function f_appel_service(nom_service varchar(50))
returns int
begin
	insert into app_appel(app_id_service, app_debut, app_fin, app_succes)
    values( (select f_ajouter_service('signature-piece-marche')), now(), null, null);
    return last_insert_id();
end !
delimiter ;

delimiter !
create function f_ajouter_document(id_appel int, id_entite_document int, id_document varchar(50))
returns int
begin
	if((select doc_id from doc_document where doc_id_appel = id_appel and doc_id_entite = id_entite_document and doc_id_document = id_document) is null) then
		insert into doc_document(doc_id_appel, doc_id_entite, doc_id_document, doc_debut, doc_fin, suc_succes)
        values(id_appel, id_entite_document, id_document, now(), null, null);
        return last_insert_id();
	end if;
    return (select doc_id from doc_document where doc_id_appel = id_appel and doc_id_entite = id_entite_document and doc_id_document = id_document);
end !
delimiter ;

delimiter !
create function f_ajouter_cron(nom_service varchar(50), frequence varchar(50))
returns int
begin
	declare id_service int;
    set id_service := (select f_ajouter_service(nom_service));
    if((select cro.cro_id from cro_cron cro join ser_service ser on ser.ser_id = cro.cro_id_service where cro.cro_id = id_service) is null)then
		insert into cro_cron(cro_id_service, cro_frequence)values(id_service, frequence);
        return last_insert_id();
	end if;
    return (select cro.cro_id from cro_cron cro join ser_service ser on ser.ser_id = cro.cro_id_service where cro.cro_id = id_service);
end !
delimiter ;

select f_ajouter_cron('signature-piece-marche', '0 */5 * * * *');

select * from ser_service;

drop function f_ajouter_service;
drop function f_appel_service;
drop function f_ajouter_document;
drop function f_ajouter_cron;
