class Productcategory < ApplicationRecord
  has_many :product, dependent: :destroy
  belongs_to :chartaccount
end
