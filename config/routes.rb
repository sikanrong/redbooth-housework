RedboothHousework::Application.routes.draw do
  
  #Contacts resource route with options:
  resources :contacts 

  post '/contacts/upload_image/:id', to: 'contacts#upload_image'

  root 'welcome#index'

end
