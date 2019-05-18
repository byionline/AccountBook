(function (jQuery) {
    $.opt = {};  // jQuery Object

    jQuery.fn.invoicevat = function (options) {
        var ops = jQuery.extend({}, jQuery.fn.invoicevat.defaults, options);
        $.opt = ops;

        var inv = new invoicevat();
        inv.init();

        jQuery('body').on('click', function (e) {
            var cur = e.target.id || e.target.className;



            if (cur == $.opt.remove_record.substring(1))
                inv.remove_recordRow(e.target);

            inv.init();
        });

        jQuery('body').on('keyup', function (e) {
            inv.init();
        });

        return this;
    };
}(jQuery));

function invoicevat() {
    self = this;
}




invoicevat.prototype = {
    constructor: invoicevat,

    init: function () {
        this.changeVal();
        this.changeVal1();
        this.calcTotal();


        this.calcTotalQty();
        this.calcSubtotal();
        this.calcSubCC();
        this.calcGrandTotal();

    },
    /**
     * Calculate Autopopulate value on Selection.
     *
     * @returns {number}
     */

changeVal: function() {
  jQuery($.opt.invoice_grid_fields).on('click', "select.product", function(i) {
//jQuery($.opt.parentClass).on('turbolinks:load', function() {
//$('form').on('load', '.product', function() {
//jQuery($.opt.product).each(function() {
  //jQuery($.opt.product).on('click',function() {
    var row = jQuery(this);
    if (row.val() =="") {
      var container;
      container = row.parents($.opt.parentClass);
    //  container.find($.opt.batch).val('');
    } else {
      jQuery.ajax({
        url: '/productpurchasevats/update_batches',
        type: 'GET',
        dataType: 'script',
        data: "product_id=" + jQuery(this).val(),
        success: function(data) {
          container = row.parents($.opt.parentClass);
          container.find($.opt.batch).empty();
          data = JSON.parse(data).map(function(i) {
            container.find($.opt.batch).append('<option value="' + i.rkbatchno + '">' + i.rkbatchno + '</option>');
            //container.find($.opt.uom).append('<option value="'+i.rkbatchpacking+'">'+i.rkbatchpacking+'</option>');
            //container.find($.opt.exp).append('<option value="'+i.rkbatchexpiry+'">'+i.rkbatchexpiry+'</option>');
            //container.find($.opt.price).append('<option value="'+i.rkbatchpurchaserate+'">'+i.rkbatchpurchaserate+'</option>');
          });
        }
      });
    }
  });
  //});
},
changeVal1: function() {
  jQuery($.opt.parentClass).on('keyup', ".batch", function() {
 //jQuery($.opt.batch).each(function() {
    var row = jQuery(this);
    if (row.val() == "") {
      var container;
      container = row.parents($.opt.parentClass);
      container.find($.opt.uom).val('');
      container.find($.opt.exp).val('');
      container.find($.opt.price).val('');

    } else {
       jQuery.ajax({
        url: '/productpurchasevats/update_batches1',
        type: 'GET',
        dataType: 'html',
        data: "batch_id=" + jQuery(this).val(),
        success: function(data) {
          container = row.parents($.opt.parentClass);
          container.find($.opt.uom).empty();
          container.find($.opt.exp).empty();
          container.find($.opt.price).empty();
          data = JSON.parse(data).map(function(i) {
            console.log(i.rkbatchpacking);
            container.find($.opt.uom).val(i.rkbatchpacking);
            container.find($.opt.exp).val(i.rkbatchexpiry);
            container.find($.opt.price).val(i.rkbatchpurchaserate);
            //container.find($.opt.uom).append('<option value="'+i.rkbatchpacking+'">'+i.rkbatchpacking+'</option>');
            //container.find($.opt.exp).append('<option value="'+i.rkbatchexpiry+'">'+i.rkbatchexpiry+'</option>');
            //container.find($.opt.price).append('<option value="'+i.rkbatchpurchaserate+'">'+i.rkbatchpurchaserate+'</option>');
          });
        }
      });
    }
  });



},    /**
     * Calculate total price of an item.
     *
     * @returns {number}
     */

     calcTotal: function() {
         jQuery($.opt.parentClass).each(function(i) {
             var row = jQuery(this);
             var total = row.find($.opt.price).val() * row.find($.opt.qty).val();
             total = self.roundNumber(total, 2);
             var subcc = row.find($.opt.price).val() * row.find($.opt.free).val();
             subcc = self.roundNumber(subcc, 2);
             //var test = row.find(".product option:selected").val();
             row.find($.opt.total).val(total);
             row.find($.opt.subcc).val(subcc);
             //console.log(test);
         });
         return 1;
     },

    /***
     * Calculate total quantity of an order.
     *
     * @returns {number}
     */
    calcTotalQty: function () {
         var totalQty = 0;
         jQuery($.opt.qty).each(function (i) {
             var qty = jQuery(this).val();
             if (!isNaN(qty)) totalQty += Number(qty);
         });

         totalQty = self.roundNumber(totalQty, 2);

         jQuery($.opt.totalQty).val(totalQty);

         return 1;
     },

    /***
     * Calculate subtotal of an order.
     *
     * @returns {number}
     */
    calcSubtotal: function () {
         var subtotal = 0;
         jQuery($.opt.total).each(function (i) {

             var total = jQuery(this).val();
             if (!isNaN(total)) subtotal += Number(total);
         });

         subtotal = self.roundNumber(subtotal, 2);


         jQuery($.opt.subtotal).val(subtotal);

         return 1;
     },

   calcSubCC: function () {
         var totalcc =0;
        jQuery($.opt.subcc).each(function (i) {
             var subcc = jQuery(this).val();
             if (!isNaN(subcc)) totalcc += Number(subcc);
         });

         totalcc = self.roundNumber(totalcc, 2);
         ccadd = totalcc * (Number(jQuery($.opt.cpercent).val())/100)
         jQuery($.opt.totalcc).val(totalcc);
         jQuery($.opt.ccadd).val(ccadd);

         return 1;
     },




    /**
     * Calculate grand total of an order.
     *
     * @returns {number}
     */
    calcGrandTotal: function () {
        var grandTotal = Number(jQuery($.opt.subtotal).val())
                       + Number(jQuery($.opt.shipping).val())
                       + Number(jQuery($.opt.ccadd).val())
                       - Number(jQuery($.opt.discount).val());
        grandTotal = self.roundNumber(grandTotal, 2);

        jQuery($.opt.grandTotal).val(grandTotal);


        return 1;
    },



    /**
     * Add a row.
     *
     * @returns {number}
     */


    /**
     * Delete a row.
     *
     * @param elem   current element
     * @returns {number}
     */
    remove_recordRow: function(elem) {
      //jQuery(elem).prev($.opt.del).val('1'); //Don't work
      //$(this).prev($.opt.del).val('1'); //Don't work
      jQuery($.opt.del).val('1'); // work but destroy all record
      jQuery(elem).closest('tr').hide();
      event.preventDefault(); // not qorking
  //     if (jQuery($.opt.remove_record).length < 1) {
  //       jQuery($.opt.del).val('1');
  //       jQuery($.opt.remove_record).hide();
  // }
  return false; //prevent from doing the default action
},
    /**
     * Round a number.
     * Using: http://www.mediacollege.com/internet/javascript/number/round.html
     *
     * @param number
     * @param decimals
     * @returns {*}
     */
    roundNumber: function (number, decimals) {
        var newString;// The new rounded number
        decimals = Number(decimals);

        if (decimals < 1) {
            newString = (Math.round(number)).toString();
        } else {
            var numString = number.toString();

            if (numString.lastIndexOf(".") == -1) {// If there is no decimal point
                numString += ".";// give it one at the end
            }

            var cutoff = numString.lastIndexOf(".") + decimals;// The point at which to truncate the number
            var d1 = Number(numString.substring(cutoff, cutoff + 1));// The value of the last decimal place that we'll end up with
            var d2 = Number(numString.substring(cutoff + 1, cutoff + 2));// The next decimal, after the last one we want

            if (d2 >= 5) {// Do we need to round up at all? If not, the string will just be truncated
                if (d1 == 9 && cutoff > 0) {// If the last digit is 9, find a new cutoff point
                    while (cutoff > 0 && (d1 == 9 || isNaN(d1))) {
                        if (d1 != ".") {
                            cutoff -= 1;
                            d1 = Number(numString.substring(cutoff, cutoff + 1));
                        } else {
                            cutoff -= 1;
                        }
                    }
                }

                d1 += 1;
            }

            if (d1 == 10) {
                numString = numString.substring(0, numString.lastIndexOf("."));
                var roundedNum = Number(numString) + 1;
                newString = roundedNum.toString() + '.';
            } else {
                newString = numString.substring(0, cutoff) + d1.toString();
            }
        }

        if (newString.lastIndexOf(".") == -1) {// Do this again, to the new string
            newString += ".";
        }

        var decs = (newString.substring(newString.lastIndexOf(".") + 1)).length;

        for (var i = 0; i < decimals - decs; i++)
            newString += "0";
        //var newNumber = Number(newString);// make it a number if you like

        return newString; // Output the result to the form field (change for your purposes)
    }
};

/**
 *  Publicly accessible defaults.
 */
jQuery.fn.invoicevat.defaults = {
  //addRow : "#addRow",
  remove_record : ".remove_record",
  del: ".del",
  parentClass : ".add_fields",
  invoice_grid_fields: ".invoice_grid_fields",
  product: ".product",
  batch: ".batch",
  uom: ".uom",
  exp: ".exp",
  price : ".price",
  qty : ".qty",
  free: ".free",
  total : ".total",
  subcc : ".subcc",
  totalcc: "#totalcc",
  totalQty: "#totalQty",
  subtotal : "#subtotal",
  discount: "#discount",
  shipping : "#shipping",
  cpercent:"#cpercent",
  ccadd : "#ccadd",
  grandTotal : "#grandTotal",
  //wo:"#wo"

};
