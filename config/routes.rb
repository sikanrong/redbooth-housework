RedboothHousework::Application.routes.draw do
  
  # Contacts RESTful resource routing...
  resources :contacts 
  
  # Default routing to connect URLs with controller-action-id pairs 
  # (used for image upload/deletion)
  post ":controller(/:action(/:id))"
  get ":controller(/:action(/:id))"
  
  root 'welcome#index'

end
