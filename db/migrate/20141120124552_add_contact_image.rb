class AddContactImage < ActiveRecord::Migration
  
  def self.up
    add_attachment :contacts, :contact_image
  end

  def self.down
    remove_attachment :contacts, :contact_image
  end

end
