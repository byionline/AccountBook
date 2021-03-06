class ApplicationController < ActionController::Base
  include Pundit
  #helper_method :company_set
  #include SelectCompany
  #helper_method :set_company_as_tenant
  #include SelectCompany
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?
  #after_action :verify_policy_scoped, unless: :devise_controller?
  set_current_tenant_through_filter
  #after_action :set_company_as_tenant, unless: :devise_controller?
  before_action :company_set, unless: :devise_controller?
  before_action :set_company_as_tenant, unless: :devise_controller?


  # def set_company
  #   if Company.first
  #     company_select_index_path
  #   else
  #     companies_path
  #   end
  # end

  protected

  def configure_permitted_parameters

    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end



  def after_sign_in_path_for(user)
    if current_user.role !="default"

      if Company.exists?
        company_select_index_path
      else
        new_company_path
      end
    else
      destroy_user_session_path

    end

  end
  private

  def company_set
    @set_company = Company.find(session[:company_id])
  rescue ActiveRecord::RecordNotFound
    if @set_company.nil?
      redirect_to company_select_index_path

    else# @set_company.exists?
      company = Company.find(session[:company_id])
      #company = Company.find(1)
      set_current_tenant(company)
    end
  end
  def user_not_authorized
    flash[:alert] = "You are not cool enough to do this - go back from whence you came."
    redirect_to(error_index_path)
  end

  def set_company_as_tenant
    company = Company.find(session[:company_id])
    #company = Company.find(1)
    set_current_tenant(company)
  end



  #    if  #  else  end else if current_user.role =="admin" companies_path else destroy_user_session_path end end #   company_select_index_path # elsif current_user.role!="default" #   company_select_index_path # else #error_index_path end  # def current_company(company)
  #   session[:company_id]=current_user.company_id
  # end
  # helper_method :current_company
  #def set_company_as_tenant
    #if current_user.role =="admin" && current_user.company_id.nil? #  companies_path #else
    # company1 = Company.find(session[:company_id]) #company = Company.find_by(id:'')
    # if current_user.company_id == company1
    #   flash[:alert] = "You are not cool enough to do this - go back from whence you came."
    #   set_current_tenant(company) # Set the tenant #
    #
    #   dashboard_index_path #end
    # else
    #   destroy_user_session_path
    # end
    #customer = Company.find(session[:company_id])
    #set_current_tenant(customer)
  #end
end
