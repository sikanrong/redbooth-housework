class ContactsController < ApplicationController
  def index
    contacts = Contact.all
    render :text => contacts.to_json, :layout=>false
  end
  
  def show
    contact = Contact.find(:first, :conditions=>["id=?", params["id"]])
    render :text => contact.to_json, :layout=>false
  end
end
