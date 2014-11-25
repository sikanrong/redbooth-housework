class ContactsController < ApplicationController
  
  # The index action corresponds to the single-page that this app operates on.
  def index
    contacts = Contact.all
    render :text => contacts.to_json, :layout=>false
  end
  
  # Used to sync a specific contact model with the client
  def show
    contact = safe_get_contact
    render :text => contact.to_json, :layout=>false
  end
  
  # Used by the client to create a Contact
  def create
    contact = Contact.create(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  # Used by the client to destroy a Contact
  def destroy
    contact = safe_get_contact
    contact.destroy
    render :text => contact.to_json, :layout=>false
  end
  
  # Used by the client to update a Contact. Usually these requests only contain
  # a attribute parameter to be changed at a time due to the client UI.
  def update
    contact = safe_get_contact
    contact.update(contact_params)
    render :text => contact.to_json, :layout=>false
  end
  
  # Used by the client to upload images
  def upload_image
    # Permit the use of the ":contact_image" parameter to satisfy the 
    # "Strong Parameters" gem
    params.permit(:contact_image)
    
    contact = safe_get_contact
    contact.contact_image = params[:contact_image]
    contact.save!
    
    render :text => contact.to_json, :layout=>false
  end
  
  # Used by the client to destroy an attached image.
  def destroy_image
    contact = safe_get_contact
    contact.contact_image = nil
    contact.save!
    render :text => contact.to_json, :layout=>false
  end
  
  private
    
    # Safely fetches the Contact by ID. Using the :conditions option of ActiveRecord::Base#find
    # will sanitize the query sent to SQL.
    def safe_get_contact
      Contact.find(:first, :conditions=>["id=?", params["id"]])
    end
  
    # Standardizes fetching the contact data from the user request parameters. 
    # Gives standard contact attributes permission for the "Strong Parameters" gem.
    def contact_params
      params.permit(:full_name, :email, :address_line_1, :address_line_2, :city, :state, :zip, :phone, :extra_notes)
    end
end
