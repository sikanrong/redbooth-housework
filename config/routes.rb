RedboothHousework::Application.routes.draw do
  
  #Contacts resource route with options:
  resources :contacts 

  root 'welcome#index'

end
