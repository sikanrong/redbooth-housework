class AddContacts < ActiveRecord::Migration
  def change
    create_table :contacts do |t|
      t.string :full_name
      t.string :address_line_1
      t.string :address_line_2
      t.string :city
      t.string :state
      t.string :zip
      t.text :extra_notes
 
      t.timestamps
    end
  end
end
