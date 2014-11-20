class Contact < ActiveRecord::Base
  has_attached_file :contact_image, :styles => { :medium => "300x300>", :thumb => "100x100>" }, :default_url => "/images/:style/missing.png"
  validates_attachment_content_type :contact_image, :content_type => /\Aimage\/.*\Z/
end