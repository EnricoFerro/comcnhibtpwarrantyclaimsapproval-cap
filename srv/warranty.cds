using com.cnhi.btp.warrantysrvs from '../db/warranty';


@path: '/ZBTP_POC3_GTW_SRV'
// @requires: 'authenticated-user'
service WarrantyService {

 entity ActionsSet
    as projection on warrantysrvs.ActionsSet;

 entity DefectSet
    as projection on  warrantysrvs.DefectSet;

 entity DefectExposedSet 
   as projection on warrantysrvs.DefectExposedSet;


 entity DefectItemDetailSet 
   as projection on warrantysrvs.DefectItemDetailSet;

 entity DefectVersionSet
    as projection on  warrantysrvs.DefectVersionSet;

 entity WarrantyListSet
    as projection on  warrantysrvs.WarrantySet;    


 entity WarrantySet
    as projection on  warrantysrvs.WarrantySet;    

 entity AttachmentSet
   as projection on warrantysrvs.AttachmentSet;

 entity AttachmentStreamSet
   as projection on warrantysrvs.AttachmentStreamSet;
}