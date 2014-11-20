class ContactsController < ApplicationController
  def index
    contacts = Contact.all
    render :text => contacts.to_json, :layout=>false
  end
  
  def show
    contact = Contact.find(:first, :conditions=>["id=?", params["id"]])
    render :text => contact.to_json, :layout=>false
  end
  
  def create
    contact = Contact.create(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  def destroy
    contact = Contact.find(:first, :conditions=>["id=?", params["id"]])
    contact.destroy
    render :text => contact.to_json, :layout=>false
  end
  
  def update
    contact = Contact.find(:first, :conditions=>["id=?", params["id"]])
    contact.update(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  private
    
    def contact_params
      params.permit(:full_name, :address_line_1, :address_line_2, :city, :state, :zip, :extra_notes)
    end
end
