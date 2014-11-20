class ContactsController < ApplicationController
  def index
    contacts = Contact.all
    render :text => contacts.to_json, :layout=>false
  end
  
  def show
    contact = safe_get_contact
    render :text => contact.to_json, :layout=>false
  end
  
  def create
    contact = Contact.create(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  def destroy
    contact = safe_get_contact
    contact.destroy
    render :text => contact.to_json, :layout=>false
  end
  
  def update
    contact = safe_get_contact
    contact.update(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  def upload_image
    #permit the use of the :contact_image parameter
    params.permit(:contact_image)
    
    contact = safe_get_contact
    contact.contact_image = params[:contact_image]
    contact.save!
    
    render :text => contact.to_json, :layout=>false
  end
  
  def destroy_image
    contact = safe_get_contact
    contact.contact_image = nil
    contact.save!
    render :text => contact.to_json, :layout=>false
  end
  
  private
    
    def safe_get_contact
      Contact.find(:first, :conditions=>["id=?", params["id"]])
    end
  
    def contact_params
      params.permit(:full_name, :email, :address_line_1, :address_line_2, :city, :state, :zip, :extra_notes)
    end
end
