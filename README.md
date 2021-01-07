# magento2-ExperianAddressValidation
#I : INSTALLATION
1. It is recommended to install the extension on a test server before you install it in a live store.
2. Backup Magento files and the store database. Important: Creating backup before installation of any extensions in Magento is extremely important,especially when are working on a live store.
3. Disable Compilation Mode in System >Tools > Compilation.
4. Disable:
◦ Magento Cache (refer to II.1.2 Disable Cache For Details)
◦ Full page cache and caching module for Magento (such as Speedster)
◦ Any Additional cache on your server,PHP cache engines,APC,etc.
Important: When developing your Magento store, in order to be able to see changes immediately, you should completely disable the cache.You can enable it after you finish configuring your store.
◦ Remove all possible custom modifications of the Magento “base” theme. "alomagicproduct"(same as any Magento theme) relieson “base” theme,so any modifications of the “base” theme can change the default behavior of alomagicproduct and break some functionality.You should never edit“base” theme's files.
◦ Log out from Magento admin panel. Do not just close the browser window: you need to click Log Out link to refresh the access control system.


#Step 1 Install  Extension
Please following steps below:
Step 1.1 :Upload the whole Extension package (app folder ) to your server
magento2-ExperianAddressValidation we got :

![img.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img.png)
![img_1.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_1.png)
![img_2.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_2.png)
step 1.2 Install extension
After uploading, run the following commands

php -dmemory_limit = 4G bin / magento setup: upgrade
php -dmemory_limit = 4G bin / magento setup: static-content: deploy -f
php -dmemory_limit = 4G bin / magento cache: flush




#Step 2  :How To Config The Extension

+ Store => Configuration => Magepow => Experian Address Validation =>Experian Address Validation => Choose Yes/No to Show or hide search Experian
![img_3.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_3.png)

+ Store => Configuration => Magepow => Experian Address Validation =>Experian Address Validation => Token API Key  You need to get your token API Key form the website https://www.experian.com.au/address-validation or you can read through the docs in the page https://docs.experianaperture.io/


+ Store => Configuration => Magepow => Experian Address Validation =>Experian Address Validation => Country  Choose You can select countries where you can use the experian search

![img_4.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_4.png)



#step 3 Results In Frontend

When you enable the Experian Address Validation  extension, you will see the show  prompt for the addresses on the My acount  and checkout shipping page

step 3.1  login Account

Please login your personal account in the page. and then click My Account => Address Book => Add New Address or Change Shipping Address

![img_5.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_5.png)


![img_6.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_6.png)








step 3.2 Checkout shipping login account or no account

+ No Account
![img_7.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_7.png)
  ![img_8.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_8.png)
+ Login Account

![img_9.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_9.png)

![img_10.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_10.png)

![img_11.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_11.png)

![img_12.png](https://github.com/magepow/magento2-ExperianAddressValidation/blob/master/media/img_12.png)

#III : CUSTOM SUPPORT
1 Support
- Ticket Support: http://alothemes.com/ticket. If you have found any bugs or have some other problems with this extension. If the problem is not covered there, you can contact us via support center. We will respond as soon as possible (within 24 – 48 hours, usually much faster)

2 -Contact
- Support Email support@alothemes.com
- Contact Sales: contact@alothemes.com

