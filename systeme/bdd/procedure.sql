delimiter !
create procedure p_terminer_appel(id_appel int, succes int)
begin
	update app_appel set app_fin = now(), app_succes = succes where app_id = id_appel;
end !
delimiter ;

delimiter !
create procedure p_ajouter_fichier(id_document int, type_fichier varchar(50), id_fichier_alfresco varchar(50))
begin
	if((select fia_id from fia_fichier_alfresco where fia_id_document = id_document and fia_type = type_fichier and fia_id_alfresco = id_fichier_alfresco) is null) then
		insert into fia_fichier_alfresco(fia_id_document, fia_type, fia_id_alfresco)
        values(id_document, type_fichier, id_fichier_alfresco);
	end if;
end !
delimiter ;

delimiter !
create procedure p_obtenir_id_alfresco(id_entite int, id_document varchar(50), type_fichier varchar(50))
begin
	select fia.fia_id_alfresco as id_alfresco
	from fia_fichier_alfresco fia
	join doc_document doc on doc.doc_id = fia.fia_id_document
	where doc.doc_id_entite = id_entite
	and doc.doc_id_document = id_document
	and fia.fia_type = type_fichier;
end !
delimiter ;

delimiter !
create procedure p_finir_appel(id_appel int, succes int)
begin
	update app_appel set app_succes = succes, app_fin = now() where app_id = id_appel;
end !
delimiter ;

delimiter !
create procedure p_obtenir_parametrage_cron(nom_service varchar(50))
begin
	declare id_service int;
   -- Ajout du service si celui n'existe pas.
	 set id_service := (select f_ajouter_cron(nom_service, '0 */10 * * * *'));
     select cro_id as id, ser.ser_nom as nom, cro.cro_frequence as frequence from cro_cron cro join ser_service ser on ser.ser_id = cro.cro_id_service where cro_id = id_service;
end !
delimiter ;

delimiter !
create procedure p_obtenir_dossier_en_cours(type_dossier varchar(50))
begin
	select
		doc.doc_id_entite as entite,
		doc.doc_id_document as document
	from doc_document doc
	join app_appel app on app.app_id = doc.doc_id_appel
	join ser_service ser on ser.ser_id = app.app_id_service
	where ser.ser_nom = type_dossier
	and doc.doc_fin is null;
end !
delimiter ;

call p_finir_appel(1, 1);
call p_terminer_appel(6, 1);
call p_ajouter_fichier(1, 'piece signee marche', 'c10908c3-dea8-486c-98a6-4453f76f3419');
call p_obtenir_id_alfresco(25, '97rIti9', 'piece signee marche');
call p_obtenir_parametrage_cron('signature-piece-marche');
call p_obtenir_dossier_en_cours('signature-piece-marche');

drop procedure p_finir_appel;
drop procedure p_terminer_appel;
drop procedure p_ajouter_fichier;
drop procedure p_obtenir_id_alfresco;
drop procedure p_obtenir_parametrage_cron;
drop procedure p_obtenir_dossier_en_cours;
