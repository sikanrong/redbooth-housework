RedboothHousework::Application.routes.draw do
  
  #Contacts resource route with options:
  resources :contacts 
  
  post ":controller(/:action(/:id))"
  get ":controller(/:action(/:id))"
  
  root 'welcome#index'

end
