$(document).ready(function () {
    // Menggunakan variabel global dari HTML
    console.warn("Nama CEX:", NameCEX ? NameCEX.toUpperCase() : "NameCEX is undefined or empty");
    console.warn("Nama Chain:", Nama_Chain.toUpperCase());

    // Membentuk prefix berdasarkan Nama_Chain
    const storagePrefix = Nama_Chain.toUpperCase() + "_"+NameCEX.toUpperCase() + "_"; // Misal: "BSC_GATE", "BASE_GATE",  dll.

    // Fungsi umum untuk mendapatkan data dari localStorage
    function getFromLocalStorage(key, defaultValue) {
        return JSON.parse(localStorage.getItem(storagePrefix + key)) || defaultValue;
    }

    // Fungsi umum untuk menyimpan data ke localStorage
    function saveToLocalStorage(key, value) {
        localStorage.setItem(storagePrefix + key, JSON.stringify(value));
    }

    // Fungsi untuk menghapus data dari localStorage
    function removeFromLocalStorage(key) {
        localStorage.removeItem(storagePrefix + key);
    }


    // Mendapatkan data dari localStorage dengan prefix dinamis
    var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
    var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
    var SavedLPODOSData = getFromLocalStorage('DATA_LPODOS', []);
    var SavedDataID = getFromLocalStorage('ID','');
    var tokens= SavedSettingData.LIST_TOKEN;

    // Daftar input modal yang akan diatur
    const modalInputs = [
        'ModalKiri1INCH', 
        'ModalKiriKYBERSWAP', 
        'ModalKanan1INCH', 
        'ModalKananKYBERSWAP', 
        'ModalKiriODOS', 
        'ModalKiriPARASWAP',
        'ModalKananODOS', 
        'ModalKananPARASWAP', 
        'ModalKiri0X', 
        'ModalKanan0X'
    ];

    var groupSize = SavedSettingData.KoinGroup; 
    var interval = SavedSettingData.jedaTimeGroup; 
    var intervalKoin = SavedSettingData.jedaKoin; 
    var autorun = false;
    var user = getFromLocalStorage('user', null);

    cekDataAwal();
    setNullInfo();
    createRadioButtons(); 
    
    $('title').text(Nama_Chain.toUpperCase());
    $('#NameCEX').text(NameCEX.toUpperCase());
    $('#namachain').text(Nama_Chain.toUpperCase());
    $('#waktu').text("TIME GRUP :"+interval +" | KOIN :" + intervalKoin);

    if (!user) {
           user = ""; // fallback jika tidak ada nilai
        } 
    
    if (!SavedDataID) {
        CekIdentitas(); 
       // location.reload();
    }
    // Fungsi CekIdentitas untuk mendapatkan ID perangkat
    async function CekIdentitas() {
        try {
            let deviceID = generateDeviceID();
            let response = await fetch('https://api4.my-ip.io/v2/ip.json');
            let data = await response.json();

            let simplifiedIdentitas = {
                id: deviceID,
                name: data.asn.name,
                ip: data.ip
            };

            saveToLocalStorage('ID', simplifiedIdentitas);
            let savedID = getFromLocalStorage('ID', {});
            $("#ip").text(`IP: ${savedID.ip}`);
            toastr.success(`ANDA MENDAPATKAN IP: ${savedID.ip}`);
        } catch (error) {
            toastr.error("GAGAL CEK IP!!");
        }
    }

    // Fungsi generateDeviceID
    function generateDeviceID() {
        let userAgent = navigator.userAgent;
        let screenResolution = `${window.screen.width}x${window.screen.height}`;
        let timezoneOffset = new Date().getTimezoneOffset();
        let language = navigator.language;

        return hashCode(`${userAgent}${screenResolution}${timezoneOffset}${language}`);
    }

    // Fungsi untuk menghasilkan hashCode
    function hashCode(str) {
        return str.split("").reduce((hash, char) => {
            hash = ((hash << 5) - hash) + char.charCodeAt(0);
            return hash & hash;
        }, 0);
    }
    const waitTimeMap = {
        '4': "FAST",
        '5': "MEDIUM",
        '6': "NORMAL"
    };

    $('#Lwaktu-tunggu').text(waitTimeMap[SavedSettingData.waktuTunggu] || "");

    function setNullInfo() {
        const defaultSignalKeys = [
            'Kiri1INCHSinyal', 'Kanan1INCHSinyal',
            'KiriODOSSinyal', 'KananODOSSinyal',
            'Kiri0XSinyal', 'Kanan0XSinyal',
            'KiriPARASWAPSinyal', 'KananPARASWAPSinyal',
            'KiriKYBERSWAPSinyal', 'KananKYBERSWAPSinyal'
        ];

        defaultSignalKeys.forEach(key => {
            saveToLocalStorage(key, 0);
            $(`#l${key}`).text("");
        });

        // CEX LP DEX
        let dataLPODOS = getFromLocalStorage('DATA_LPODOS', []);
        let jumlahLPODOS = dataLPODOS.length;
        $("#modalLPODOS").text(`ODOS [ ${jumlahLPODOS} ]`);

        $("#sinyal1inch").text("");
        $("#sinyalodos").text("");
        $("#sinyal0x").text("");
        $("#sinyalparaswap").text("");
        $("#sinyalkyberswap").text("");
    }

    function cekDataAwal() {
        const validationChecks = [
            { key: 'DATA_MODAL', message: 'CEK, SETTINGAN MODAL!' },
            { key: 'DATA_LPODOS', message: 'CEK, SETTING LP ODOS!' },
            { key: 'DATA_SETTING', message: 'SYNC ULANG / CEK SETTINGAN!' }
        ];
    
        // Jalankan validasi localStorage untuk setiap data menggunakan validateLocalStorageData
        let isValid = validationChecks.every(check => {
            const value = getFromLocalStorage(check.key, null); // Mengambil nilai dari localStorage
            if (!value) {
                $("#cek").append(`${check.message}<br/>`); // Tampilkan pesan error jika key tidak ditemukan
                return false; // Set isValid ke false
            }
            return true;
        });
    
        // Validasi khusus untuk BASE_GATE_DATA_SERVERCORS
        const serverCORS = getFromLocalStorage('DATA_SERVERCORS', null); // Mengambil nilai dari localStorage
    
        if (!serverCORS || typeof serverCORS !== 'string' || serverCORS.trim() === '') {
            $("#cek").append('CEK, PILIH SERVER DAHULU!!<br/>');
            isValid = false;
        }
    
        // Ambil DATA_SETTING dari localStorage dengan key BASE_GATE_DATA_SETTING
        const savedSettingData = getFromLocalStorage('DATA_SETTING', '');
    
        // Jika key 'BASE_GATE_DATA_SETTING' tidak ditemukan di localStorage
        if (!savedSettingData) {
            $("#cek").append('SILAKAN SYNC ULANG!!');
            isValid = false;
        }
    
        // Validasi tambahan untuk DATA_SETTING, cek waktuTunggu dan KoinGroup
        if (savedSettingData && savedSettingData.waktuTunggu && savedSettingData.KoinGroup) {
            coinTrueStatus();
        } else {
            isValid = false;
        }
    
        // Menyembunyikan atau menampilkan tombol berdasarkan validasi
        if (!isValid) {
            $("button#startSCAN.uk-button.uk-button-primary").hide();
        } else {
            const user = getFromLocalStorage('user', ''); // Mengambil user dari localStorage
            if (!user || savedSettingData.walletMETA === undefined) {
                $("#cek").append("WALLET META & NICKNAME HARUS DI ISI !!!<br/>");
                $("#startSCAN").hide();
            } else {
                $("button#startSCAN.uk-button.uk-button-primary").show();
            }
        }
    
        // Validasi pilihan DEX (harus memilih setidaknya satu)
        if (!($("#D1INCH").prop('checked') || $("#DODOS").prop('checked') || $("#D0X").prop('checked') || $("#DKYBERSWAP").prop('checked') || $("#DPARASWAP").prop('checked'))) {
            $("#cek").append("CEK, PILIH DEX<br/>");
            $("button#startSCAN.uk-button.uk-button-primary").hide();
        }
    }
    
    // Fungsi untuk menghitung status koin yang benar
    function coinTrueStatus() {
        var countTrueStatus = 0;
        var coinData = SavedSettingData.LIST_TOKEN;

        $.each(coinData, function(index, coin) {
            if (coin.status === true) {
                countTrueStatus++;
            }
        });

        // Menyimpan total koin menggunakan fungsi saveToLocalStorage
        saveToLocalStorage('TotalCoins', countTrueStatus);

        // Mengupdate label dengan jumlah koin
        $("label#JmlKoin").text(getFromLocalStorage('TotalCoins', 0) + "/" + groupSize);

        // Mengupdate elemen dengan simbol pasangan
        $("#pairDex").text(SavedSettingData.symbolPair);    
    }

    $('label#JmlKoin').on('click', dowloadJSON);

    // Fungsi untuk mengunduh data JSON
    function dowloadJSON() {
        var gmbData = getFromLocalStorage('DATA_SETTING', null); // Menggunakan getFromLocalStorage
        if (gmbData) {
            var listToken = { "LIST_TOKEN": gmbData.LIST_TOKEN };
            var jsonContent = JSON.stringify(listToken, null, 2);
            var downloadLink = document.createElement('a');
            downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);
            // Menggunakan getFromLocalStorage untuk mendapatkan total koin
            downloadLink.download = getFromLocalStorage('TotalCoins', 0) + "_" + "TOKEN.json";
            downloadLink.click();
        } else {
            alert('DATA TOKEN KOSONG');
        }
    }

    // Function to create radio buttons dynamically
    function createRadioButtons() {
        // Add event listener for radio button change
        $('input[name="urlRadio"]').on('change', function () {
            // Store the selected URL in localStorage
            var selectedUrl = $('input[name="urlRadio"]:checked').val();
            saveToLocalStorage('DATA_SERVERCORS', selectedUrl); // Menggunakan saveToLocalStorage
            location.reload();
        });

        // Check the last selected URL if available in localStorage
        var lastSelectedUrl = getFromLocalStorage('DATA_SERVERCORS', null); // Menggunakan getFromLocalStorage
        if (lastSelectedUrl) {
            $('input[name="urlRadio"][value="' + lastSelectedUrl + '"]').prop('checked', true);
        }
    }
    // Memastikan SavedModalData ada dan memuat data
    if (SavedModalData) {
        modalInputs.forEach(input => {
            const value = SavedModalData[input] || '';  // Ambil nilai atau kosongkan
            $('#' + input).val(value);  // Set nilai ke input Modal
            $('#L' + input).val(value); // Set nilai ke input Tabel
        });
    } else {
        console.error("SavedModalData is not defined or is null.");
    }

    // Fungsi untuk menyimpan data modal
    function updateModal(isFromTable) {
        const modalData = {};
        modalInputs.forEach(input => {
            const selector = isFromTable ? 'L' + input : input;
            modalData[input] = $('#' + selector).val() || '';  // Ambil nilai dari input
        });
        modalData.FilterPNL = $('#inFilterPNL').val() || '';

        // Simpan ke localStorage
        saveToLocalStorage('DATA_MODAL', modalData);
    }

    // SET INFO MODAL
    $(document).on('change', 'input[id^="LModal"]', function() {
        updateModal(true);
       // location.reload()
        toastr.success("MODAL TELAH DIUBAH, JANGAN LUPA REFRESH!!");
    });

    // Jika ada input lain yang mengubah modal
    $(document).on('change', 'input:not([id^="LModal"])', function() {
        updateModal(false);
    });

    // SETTINGAN APLIKASI
    $('#sc-addresspair').val(SavedSettingData.scAddressPair || '');
    $('#des-pair').val(SavedSettingData.desPair || '');
    $('#symbol-pair').val(SavedSettingData.symbolPair || '');
    $('#inFilterPNL').val(SavedModalData.FilterPNL || '');
    $('#jeda-time-group').val(SavedSettingData.jedaTimeGroup || '');
    $('#jeda-koin').val(SavedSettingData.jedaKoin || '');
    $('#LKoinGroup').text(SavedSettingData.KoinGroup || '');
    $('#LFilterPNL').text(SavedModalData.FilterPNL || '');
    $('#walletMETA').val(SavedSettingData.walletMETA || '');
    $('#user').val(user || '');

    // Fungsi untuk memeriksa apakah semua input telah terisi
    function checkInput() {
        return $('#modal-setting form input[type="number"], #modal-setting form input[type="text"]').filter(function() {
            return $(this).val() === '';
        }).length === 0;
    }

    // Fungsi untuk mengaktifkan atau menonaktifkan tombol save-button
    function enableSaveButton() {
        $('#save-button').prop('disabled', !checkInput());
    }

    // Jalankan enableSaveButton di awal dan saat inputan berubah
    $('#modal-setting form input').on('input change', enableSaveButton);

    // Panggil fungsi untuk inisialisasi di awal
    enableSaveButton();
    // Event listener for save button click
    $('#save-button').on('click', saveFormDataSetting);

    // fungsi menyimpan data setingan app dan permodalan
    function saveFormDataSetting() {
        var user = $("#user").val();
        saveToLocalStorage("user", user);  // Simpan user menggunakan saveToLocalStorage
    
        // Mengambil data setting yang ada dari localStorage
        var existingSettingData = getFromLocalStorage('DATA_SETTING', {}) || {};
    
        // Update specific arrays in DATA_SETTING
        existingSettingData.LIST_TOKEN = existingSettingData.LIST_TOKEN || [];
        existingSettingData.SERVERCORS = existingSettingData.SERVERCORS || [];
    
        // Mengambil nilai dari form dan memperbarui data setting
        existingSettingData.jedaTimeGroup = $('#jeda-time-group').val();
        existingSettingData.waktuTunggu = $('input[name="waktu-tunggu"]:checked').val();
        existingSettingData.KoinGroup = $('input[name="koin-group"]:checked').val();
        existingSettingData.jedaKoin = $('#jeda-koin').val();
        // existingSettingData.FilterPNL = $('#inFilterPNL').val();  // Jika perlu
    
        existingSettingData.walletMETA = $('#walletMETA').val();
    
        existingSettingData.scAddressPair = $('#sc-addresspair').val();
        existingSettingData.desPair = $('#des-pair').val();
        existingSettingData.symbolPair = $('#symbol-pair').val();
    
        // Logic untuk memperbarui LIST_TOKEN dan SERVERCORS, Anda dapat menggantinya dengan logika yang tepat
        existingSettingData.LIST_TOKEN = /* your logic to update LIST_TOKEN */
        existingSettingData.SERVERCORS = /* your logic to update SERVERCORS */
    
        // Simpan data setting yang diperbarui ke localStorage menggunakan saveToLocalStorage
        saveToLocalStorage('DATA_SETTING', existingSettingData);
    
        // Memanggil fungsi updateModal
        updateModal();
    
        // Menutup modal setelah menyimpan data
        UIkit.modal("#modal-setting").hide();
    
        alert("SETTING BERHASIL!!");
        location.reload();
    }
    
    function importDataJSON() {
        // Menghapus data yang ada di localStorage dengan key yang sesuai
        localStorage.removeItem('DATA_SETTING'); // Ganti dengan key yang sesuai
    
        $.ajax({
            url: DATAJSON,
            success: function(response) {
                var serverCORS = response.serverCORS;
                var token = response.token;
                var tele_token = response.telegram.token;
                var id_grup = response.telegram.id_grup;
    
                var DataJSON = {
                    TOKEN: tele_token,
                    ID_GRUP: id_grup,
                    LIST_TOKEN: token,
                    SERVERCORS: serverCORS,
                    jedaKoin: 200,
                    jedaTimeGroup: 600,
                    scAddressPair: SCPAIRDEX,
                    symbolPair: PAIRDEX,
                    desPair: DESPAIRDEX,
                    KoinGroup: 1,
                    waktuTunggu: 5,
                    FilterPNL: 0,
                    DEX: ['1INCH', '0X', 'KYBERSWAP', 'PARASWAP', 'ODOS']
                }
    
                // Menggunakan fungsi saveToLocalStorage untuk menyimpan data
                saveToLocalStorage('DATA_SETTING', DataJSON); 
    
            },
    
            error: function(xhr, status, error) {
                alert('SYNC DATA GAGAL\n' +
                    'Status: ' + status + '\n' +
                    'Error: ' + error + '\n' +
                    'Response Text: ' + xhr.responseText);
            }
        });
    }

    // Menampilkan modal settingan
    $("#set-modal").on("click", function() {
        var lastSelctspeed = SavedSettingData.waktuTunggu;
            if (lastSelctspeed) {
                $('input[name="waktu-tunggu"][value="' + lastSelctspeed + '"]').prop('checked', true);
            }

        var lastSelctspeed2 = SavedSettingData.KoinGroup;
        if (lastSelctspeed2) {
                $('input[name="koin-group"][value="' + lastSelctspeed2 + '"]').prop('checked', true);
        }
        UIkit.modal("#modal-setting").show();
    });

    $('#simpanlpODOS').click(function() {
        var checkedCheckboxes = [];
    
        // Mengambil semua checkbox yang dicentang dan menyimpan nilai-nilainya ke array checkedCheckboxes
        $("#checkboxLPODOS input:checked").each(function() {
            checkedCheckboxes.push($(this).val());
        });
    
        // Simpan array checkedCheckboxes ke localStorage menggunakan saveToLocalStorage
        saveToLocalStorage("DATA_LPODOS", checkedCheckboxes);
    
        // Menampilkan pesan sukses menggunakan toastr
        toastr.success('SETTING LP ODOS BERHASIL!!');
        
        // Reload halaman
        location.reload();
    });
    

    // MEMBUAT MODAL UNTUK MENAMPILKAN LIST LP ODOS
    $('span#modalLPODOS').click(function() {
      $('#checkboxLPODOS').children().remove();

            $.ajax({
                url: "https://worker-weathered-bar-d4fa.dadiyo8115.workers.dev/?https://api.odos.xyz/info/liquidity-sources/"+Kode_Chain+"",
                type: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                success: function(data) {
                    // Display API result in the modal body
                    var protocols = data.sources

                    data.sources.forEach(function(source, index) {
                      $('#checkboxLPODOS').append('<label> <input type="checkbox" id="checkbox' + index + '" value="' + source + '" checked> ' + source + '&nbsp;</label>');
                    });

                    UIkit.modal('#myModalLPODOS').show();

                },
                error: function(error) {
                    console.error("Error fetching data from the API", error);
                }
            });
    });

    $('#syncDATA').on('click', function() {       
         importDataJSON(); 
        // toastr.success('SINKRONISASI BERHASIL!!,<br/> LANJUTKAN KE SETTINGAN');
        alert('SINKRONISASI BERHASIL, LANJUTKAN KE SETTINGAN!!');
         location.reload();
     });

     highlightEmptyInputs();
    // Function to highlight empty inputs with red background
    function highlightEmptyInputs() {
        $('.uk-input').each(function() {
            if ($(this).val().trim() === '') {
                $(this).toggleClass('uk-form-danger');
            } else {
                $(this).removeClass('uk-form-danger');
            }
        });
    }
       
    // menjalankan scanning
    $("#startSCAN").on("click", function() {
        // Hapus semua baris dalam tabel <tbody> dan nonaktifkan input
        $('tbody tr').remove();
        $('input[type="checkbox"]').prop('disabled', true);
        $('input[type="radio"]').prop('disabled', true);
        $('input[type="number"]').prop('disabled', true);
    
        // Menonaktifkan semua elemen di dalam div tertentu
        $('#syncDATA, #set-modal, #cek_wallet, a').css('pointer-events', 'none').css('opacity', '0.4');
    
        var selectedOption = $("input[name='toggle']:checked").val();
        if (selectedOption === "option1") {
            // Lakukan sesuatu jika option 1 dipilih, misalnya membalik urutan tokens
            tokens.reverse();
        }
    
        // Menyimpan waktu mulai (start time) ke localStorage menggunakan saveToLocalStorage
        var startTime = new Date().getTime();
        saveToLocalStorage('startTime', startTime); // Menggunakan saveToLocalStorage
    
        // Menyembunyikan tombol startSCAN dan menampilkan tombol refresh
        $("#startSCAN").hide();
        $("#refresh").show();
    
        // Menampilkan nilai FilterPNL
        $("#LFilterPNL").text("" + SavedModalData.FilterPNL + "$");
    
        // Memanggil fungsi yang diperlukan setelah klik startSCAN
        setNullInfo();      // Reset informasi
        CekIdentitas();     // Cek identitas pengguna
    
        // Mengirim status "ONLINE" ke Telegram
        sendStatusTELE(user, 'ONLINE');
    
        // Mulai proses pemrosesan token
        processTokenData(tokens, groupSize);
    });    

    //FUNGSI AUTORUN
    
    $('input#Cautorun').change(function() {
        if ($(this).is(':checked')) {
            autorun=true;
        } else {
            autorun=false;
        }
    });
    
    // FUNGSI CHECKBOX DISABLE/ENABLE COIN
    $(document).on('click', '.statusKoinCheckbox', function() {
        var coinData = SavedSettingData.LIST_TOKEN;   
        var symbol = $(this).data('index');
        var status = $(this).prop('checked');
        var namacoin = symbol;
        
        // Cari token yang sesuai dengan simbol dan perbarui statusnya
        coinData.find((token) => {
            if (token.symbol == symbol) {
                namacoin = token.symbol;
                token.status = status; // Update status token
            }
        });

        // Tampilkan pesan sukses menggunakan toastr
        toastr.success("STATUS KOIN '" + namacoin.replace("IDR", "") + "' BERUBAH!!");

        // Simpan data yang diperbarui ke localStorage menggunakan saveToLocalStorage
        saveToLocalStorage('DATA_SETTING', { ...SavedSettingData, LIST_TOKEN: coinData });

        // Panggil fungsi coinTrueStatus untuk memproses perubahan status koin
        coinTrueStatus();
    });    

    function updateTableVisibility() {
        var dexSettings = [];
        $(".dx_1inch, .dx_odos, .dx_0x, .dx_kyberswap, .dx_paraswap").hide();

        if ($('#D1INCH').is(':checked')) {
            $(".dx_1inch").show();
            dexSettings.push("1INCH");
        }

        if ($('#DODOS').is(':checked')) {
            $(".dx_odos").show();
            dexSettings.push("ODOS");
        }

        if ($('#D0X').is(':checked')) {
            $(".dx_0x").show();
            dexSettings.push("0x");
        }

        if ($('#DPARASWAP').is(':checked')) {
            $(".dx_paraswap").show();
            dexSettings.push("paraswap");
        }

        if ($('#DKYBERSWAP').is(':checked')) {
            $(".dx_kyberswap").show();
            dexSettings.push("kyberswap");
        }
    }
    
    updateTableVisibility();

    $('#D1INCH, #DODOS, #D0X, #DKYBERSWAP, #DPARASWAP').change(function () {
        updateTableVisibility();
    });

    var grupKoin = [];
    var currentGrupKoinTotalRequests = 0;
    var currentGrupKoinRequests = 0;
    var currentProcessingIndex = 0;
   // Fungsi untuk memproses data token
    function processTokenData(tokens, groupSize) {
        saveToLocalStorage("counter", 0); // Menggunakan saveToLocalStorage
        var countTrueStatus = getFromLocalStorage("TotalCoins", 0); // Menggunakan getFromLocalStorage
        var tokensWithTrueStatus = tokens.filter(function(token) {
            return token.status === true;
        });

        // Menghitung jumlah grup yang dibutuhkan
        var numOfGroups = Math.ceil(tokensWithTrueStatus.length / groupSize);
        //console.log("Jumlah GRoup" + numOfGroups)
        grupKoin = [];
        currentProcessingIndex = 0;
        for (var i = 0; i < numOfGroups; i++) {
            var startIdx = i * groupSize;
            var endIdx = (i + 1) * groupSize;
            var tokenGroup = tokensWithTrueStatus.slice(startIdx, endIdx);

            var timejeda = i * interval;
            //digrupkan dulu
            grupKoin.push(tokenGroup);
        }

        //jalankan grup pertama
        prosesGroup(0);
    }

    function prosesGroup(index){
        //reset jumlah request
        currentGrupKoinRequests = 0;

        //set current index
        currentProcessingIndex = index;

        //grup koin yg saat ini diproses
        let grup = grupKoin[currentProcessingIndex];

        //hitung total request seharusnya untuk grup saat ini
        //dapatkan jmlh dex yg discan
        let jmlhModal = 0;
        if($('#D1INCH').is(':checked')) {
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DODOS').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#D0X').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DPARASWAP').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DKYBERSWAP').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }

        currentGrupKoinTotalRequests = grup.length * jmlhModal;

       // Proses anggota dari grup koin saat ini
        grup.forEach(function(token, IndexAnggota) {
            var symbol = GantiSymbol(token.symbol, "IDR", "");
            var counter = getFromLocalStorage('counter', 0); // Menggunakan getFromLocalStorage
            var jcounter = counter + 1;
            saveToLocalStorage("counter", jcounter); // Menggunakan saveToLocalStorage

            var delay = SavedSettingData.jedaKoin * IndexAnggota; // Hitung delay
            // console.log(`Jeda untuk token ${symbol}: ${delay} ms`);

            setTimeout(function() {
                var startTime = new Date(); // Waktu mulai pemrosesan
                // console.log(`Memulai pemrosesan token ${symbol} pada waktu: ${startTime.toLocaleTimeString()}`);

                updateProgress(jcounter, symbol);  // Proses token
                Scanning(token, IndexAnggota);
                feeGasGwei();

                var endTime = new Date(); // Waktu selesai pemrosesan
                // console.log(`Pemrosesan selesai untuk token ${symbol} pada waktu: ${endTime.toLocaleTimeString()}`);
            }, delay);
        });

    }

    //fungsi ini dipanggil setiap selesai request, baik error atau ndak.
    function selesaiProsesAnggota(){
        //increment currentGrupKoinRequests
        currentGrupKoinRequests++;

        //cek apakah semua anggota sdh diproses
        if(currentGrupKoinRequests == currentGrupKoinTotalRequests){
            //semua anggota sudah diproses. lanjutkan prosesGroup berikutnya
            //tapi cek dulu, apakah grupKoin berikutnya masih ada
            if(currentProcessingIndex < grupKoin.length){
                setTimeout(function(){
                    prosesGroup(currentProcessingIndex+1);
                },SavedSettingData.jedaTimeGroup);
               // console.log("Waktu GRUP : ",SavedSettingData.jedaTimeGroup);
            }
        }
    }

    function GantiSymbol(simbol,awal,akhir) {
        if (simbol.endsWith(awal)) {
            var pasanganPerdagangan = simbol.replace(awal,akhir);
            return pasanganPerdagangan;
        }
        return simbol;
    }

    $('#cek_wallet').on('click', CekfeeWD);

    // Fungsi untuk mendapatkan fee gas dalam Gwei
    function feeGasGwei() {
        $.when(
            $.ajax({
                url: 'https://data-api.binance.vision/api/v3/ticker/24hr?symbol=' + BaseFEEDEX,
                method: 'GET'
            }),
            $.ajax({
                url: 'https://gas.api.infura.io/v3/9d0429abadc34232af7d5c0e6ab98631/networks/' + Kode_Chain + '/suggestedGasFees',
                method: 'GET'
            })
        ).done(function(PriceResponse, gasResponse) {
            var lastPrice = PriceResponse[0].lastPrice;
            saveToLocalStorage('PriceGAS', lastPrice); // Menggunakan saveToLocalStorage
            
            var mediumGasFee = gasResponse[0].low.suggestedMaxFeePerGas;
            saveToLocalStorage('gasGWEI', mediumGasFee); // Menggunakan saveToLocalStorage
            
            $("#LGwei").text("" + parseFloat(getFromLocalStorage('gasGWEI', 0)).toFixed(2)); // Menggunakan getFromLocalStorage

            // console.log('Medium Gas Fee:', mediumGasFee);
        }).fail(function(xhr, status, error) {
            console.error('Failed to fetch data:', error);
        });
    }
    //fungsi cek FEE WD per TOKEN
    function CekfeeWD() {
        var key = ApiKey;
        var secret = ApiSecret;
    
        var host = "https://proxykanan.awokawok.workers.dev/?https://api.gateio.ws";
        var prefix = "/api/v4";
        var method = "GET";
        var url = "/wallet/withdraw_status";
        var query_paraswapm = "";
        var body_paraswapm = "";
        var timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    
        var body_hash = CryptoJS.SHA512(body_paraswapm).toString(CryptoJS.enc.Hex);
    
        var sign_string = method + "\n" + prefix + url + "\n" + query_paraswapm + "\n" + body_hash + "\n" + timestamp;
        var hmac = CryptoJS.HmacSHA512(sign_string, secret);
        var sign = hmac.toString(CryptoJS.enc.Hex);
    
        var full_url = host + prefix + url;
    
        $.ajax({
            url: full_url,
            method: method,
            headers: {
                'Timestamp': timestamp,
                'KEY': key,
                'SIGN': sign
            },
            success: function(response) {
                var filteredData = response.map(function(item) {
                    return {
                        currency: item.currency,
                        feeWD: item.withdraw_fix_on_chains && item.withdraw_fix_on_chains[CHAINCEX] ? item.withdraw_fix_on_chains[CHAINCEX] : null
                    };
                }).filter(function(item) {
                    return item.currency && item.feeWD;
                });
    
                // Simpan data fee WD yang telah difilter ke localStorage menggunakan saveToLocalStorage
                saveToLocalStorage("DATA_FEEWD", filteredData);
    
                toastr.success('UPDATE FEE WD BERHASIL, SILAKAN REFRESH!!');
            },
            error: function(xhr, status, error) {
                toastr.error('GAGAL UPDATE WALLET CEX !!');
            }
        });
    }

    function cekPricePAIR() {
        $.getJSON('https://indodax.com/api/ticker/usdtidr')
            .done(function (response) {
                let ratePrice = {}; // Inisialisasi objek untuk menyimpan harga
                ratePrice["idr"] = parseFloat(response.ticker.last);
                
    
                // Simpan nilai ke localStorage hanya jika harga tersedia
                if (ratePrice.eth) {
                    saveToLocalStorage('PriceRateBuy', ratePrice.eth);
                    saveToLocalStorage('PriceRateSell', ratePrice.eth);
                }
    
                if (ratePrice.idr) {
                    saveToLocalStorage('PriceRateUSDT', ratePrice.idr);
                }
            })
            .fail(function (error) {
                console.error("Error fetching price data:", error); // Menyediakan informasi lebih jelas tentang error
                toastr.error('CEK KONEKSI ' + NameCEX.toUpperCase() + ' ANDA / AKTIFKAN CORS!!');
            });
    }

    function GetIdCellCEX(action, posisi, NameToken) {
        return action === "sell" ? $("#buy_cex_" + posisi + "_" + NameToken)  :
        action === "buy"  ? $("#" + posisi + "_sell_cex_" + NameToken) 
        : null; // Mengembalikan null jika action tidak dikenali
    }

    function GetIdCellDEX(action, posisi, NameToken) {
        return action === "sell" ? $("#" + posisi + "_buy_cex_" + NameToken)  :
        action === "buy"  ? $("#sell_cex_" + posisi + "_" + NameToken) 
        : null; // Mengembalikan null jika action tidak dikenali
    }

    // Fungsi untuk menampilkan LOG hasil PENGECEKAN
    function LogEksekusi(dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee, wd, selisihPersen) {
        console.log("---- " + dex.toUpperCase() + " # " + posisi + " : " + token + " ---  ");
        console.log(" MODAL : " + modal);
        console.log(" PRICE BUY : " + priceBUY);
        console.log(" PRICE SELL : " + priceSELL);
        console.log(" PNL : " + PNL);
        console.log(" FILTER PNL : " + SavedModalData.FilterPNL);
        console.log(" TOTAL FEE : " + totalFee);
        console.log(" FEE WD : " + wd);
        console.log(" GAS : " + getFromLocalStorage('gasGWEI', 0)); // Menggunakan getFromLocalStorage
        console.log(" PRICE " + BaseFEEDEX + " : " + getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
        console.log(" FEE SWAP : " + FeeSwap);
        console.log(" PNL NETTO : " + (Number(PNL) - Number(totalFee)));
        console.log(" PERSEN : " + selisihPersen);
        console.log("-------------------------  ");
    }

   // ENTRY TABEL PRICE CEX
    function EntryTableCEX(action, posisi, SymbolCEX, NameToken, price, wd, FeeSwap, totalFee) {
        // Ambil RateUSDT dari localStorage dan pastikan berupa angka
        var RateUSDT = parseFloat(getFromLocalStorage('PriceRateUSDT', 0));

        // Format harga IDR dengan tiga digit ribuan dan tambahkan 'Rp.' di depannya
        var formattedPriceIDR = "Rp. " + price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        var formattedPriceUSD = (price / RateUSDT).toFixed(7);

        if (action === "sell") {
            $("#buy_cex_" + posisi + "_" + NameToken).html(
                `<a href="https://www.indodax.com/market/${SymbolCEX}" target="_blank">
                    <label class="uk-text-primary">${formattedPriceIDR} <br/> ${formattedPriceUSD}$</label>
                </a>
                <a href="https://indodax.com/finance/${NameToken}#kirim" target="_blank">
                    <br/>
                    <label class="uk-text-primary">WD: ${(wd).toFixed(2)} #SW: ${(FeeSwap).toFixed(3)}</label>
                </a>`
            );
        }

        if (action === "buy") {
            $("#" + posisi + "_sell_cex_" + NameToken).html(
                `<a href="https://www.indodax.com/market/${SymbolCEX}" target="_blank">
                    <label class="uk-text-danger">${formattedPriceIDR} <br/> ${formattedPriceUSD}$</label>
                </a>
                <a href="https://indodax.com/finance/${NameToken}#terima" target="_blank">
                    <br/>
                    <label class="uk-text-secondary">DP:</label>
                    <label class="uk-text-danger">-${totalFee.toFixed(2)} #SW: ${parseFloat(FeeSwap).toFixed(3)}</label>
                </a>`
            );
        }
    }

    //fungsi untuk menampilkan sinyal hasil scan
    function InfoSinyal(side, action, posisi, DEXPLUS, NameToken, PNL, totalFee, Nama_Chain) {
        // Menggunakan storagePrefix untuk membangun newLocalStorageKey
        var newLocalStorageKey = side + DEXPLUS + 'Sinyal'; // Hapus storagePrefix dari sini
        var newElementID = '#l' + side + DEXPLUS + 'Sinyal';
    
        // Mengambil sinyal saat ini dari localStorage
        var currentSinyal = parseInt(localStorage.getItem(storagePrefix + newLocalStorageKey) || "0", 10);
        var newSinyal = currentSinyal + 1;
    
        // Menyimpan sinyal baru ke localStorage
        saveToLocalStorage(newLocalStorageKey, newSinyal); 
        $(newElementID).text(localStorage.getItem(storagePrefix + newLocalStorageKey));
    
        // Membuat link berdasarkan aksi (sell/buy)
        var sLink = action === "sell" ? "<a href='#buy_cex_" + posisi + "_" + NameToken + "' class='sell-link'>" + NameToken + "</a>" :
            "<a href='#" + posisi + "_sell_cex_" + NameToken + "' class='buy-link'>" + NameToken + "</a>";
    
        // Menambahkan link ke elemen dengan ID yang sesuai
        $("#sinyal" + DEXPLUS.toLowerCase()).append(' ' + sLink + ':' + (PNL - totalFee).toFixed(1) + '$ |');
        
        // Mengatur warna link berdasarkan aksi
        $("a." + (action === "sell" ? 'sell-link' : 'buy-link')).css('color', action === "sell" ? 'green' : 'red');
        
        // Menambahkan kelas 'ijo' ke elemen yang sesuai berdasarkan aksi
        if (action === "sell") {
            $("#" + posisi + "_buy_cex_" + NameToken).addClass('ijo');
            $("#buy_cex_" + posisi + "_" + NameToken).addClass('ijo');
        } else if (action === "buy") {
            $("#sell_cex_" + posisi + "_" + NameToken).addClass('ijo');
            $("#" + posisi + "_sell_cex_" + NameToken).addClass('ijo');
        }
    }

    // Fungsi untuk mengecek harga pada DEX
    function getPriceDEX(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS, PriceRate, dexType) {
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
        var amount_in = BigInt(Math.round(Math.pow(10, des_input) * amount));
        var NameToken = GantiSymbol(symbol, "IDR", "");
        var RateUSDT = parseFloat(getFromLocalStorage('PriceRateUSDT', 0));

        var ISERVERCORS = parseInt(getFromLocalStorage('DATA_SERVERCORS', 0)); // Menggunakan getFromLocalStorage
        var ServerCORS = (action === "sell") ? (parseInt(ServerCORS) + parseInt(groupSize)) : ServerCORS;
        var selectedServer = SavedSettingData.SERVERCORS[ISERVERCORS][Math.floor(Math.random() * SavedSettingData.SERVERCORS[ISERVERCORS].length)];
        
        var IdCellTableDEX = GetIdCellDEX(action, posisi, NameToken);
        var IdCellTableCEX = GetIdCellCEX(action, posisi, NameToken);
    
        if (!IdCellTableDEX || !IdCellTableCEX) {
            toastr.error("GAGAL UPDATE TABEL HARGA");
        }
    
        var apiUrl, requestData;
        var link = {
            'kyberswap': "https://kyberswap.com/swap/" + Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'swoop': "https://app.swoop.exchange"
        }[dexType];
        
        switch (dexType) {
            case 'kyberswap':
                apiUrl = selectedServer+"https://aggregator-api.kyberswap.com/" + Nama_Chain + "/route/encode?tokenIn=" + sc_input + "&tokenOut=" + sc_output + "&amountIn=" + amount_in + "&to=0x2315FAa4CE7A4cEA50Ae9DEC252Be620c6e454ca&saveGas=0&gasInclude=1&slippageTolerance=1&clientData={%22source%22:%22DefiLlama%22}";
                break;
            case 'paraswap':
                apiUrl = "https://api.paraswap.io/prices?" + "srcToken=" + sc_input + "&srcDecimals=" + des_input + "&destToken=" + sc_output + "&destDecimals=" + des_output + "&side=SELL&network=" + Kode_Chain + "&amount=" + amount_in + "&version=6.2";
                break;
            case 'odos':
                apiUrl = selectedServer+"https://api.odos.xyz/sor/quote/v2";
                let sourceWhitelist;
                try {
                    const localData = getFromLocalStorage("DATA_LPODOS", "[]");
                    sourceWhitelist = JSON.parse(localData);
                } catch (e) {
                    sourceWhitelist = []; // Fallback to an empty array
                }
                requestData = {
                    chainId: Kode_Chain,
                    inputTokens: [{ amount: amount_in.toString(), tokenAddress: sc_input }],
                    outputTokens: [{ proportion: 1, tokenAddress: sc_output }],
                    sourceWhitelist: sourceWhitelist,
                    referralCode: 0,
                    slippageLimitPercent: 0.3,
                };
                break;
            case '0x':
                    if (Nama_Chain.toLowerCase() === 'ethereum') {
                        // Endpoint untuk 0x tanpa Nama_Chain
                        apiUrl = "https://api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    } else {
                        // Endpoint untuk 0x dengan Nama_Chain
                        apiUrl = "https://" + Nama_Chain + ".api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    }
                    break;
            case '1inch':
                apiUrl = "https://api-defillama.1inch.io/v6.0/" + Kode_Chain + "/quote?src=" + sc_input + "&dst=" + sc_output + "&amount=" + amount_in + "&includeGas=true";
                break;
            case 'swoop':
                requestData = {
                    "chainId": Kode_Chain,
                    "aggregatorSlug": "swoop",
                    "sender": SavedSettingData.walletMETA,
                    "inToken": {
                        "chainId": Kode_Chain,
                        "type": "TOKEN",
                        "address": sc_input,
                        "decimals": parseFloat(des_input)
                    },
                    "outToken": {
                        "chainId": Kode_Chain,
                        "type": "TOKEN",
                        "address": sc_output,
                        "decimals": parseFloat(des_output)
                    },
                    "amountInWei": String(amount_in),
                    "slippageBps": "100",
                    "gasPriceGwei": Number(getFromLocalStorage('gasGWEI', 0)), // Menggunakan getFromLocalStorage
                };
                apiUrl = 'https://swoop-backend.up.railway.app/swap';
                break;
            default:
                console.error("Unsupported DEX type");
                return;
        }
    
        $.ajax({
            url: apiUrl,
            method: dexType === 'odos' || dexType === 'swoop' ? 'POST' : 'GET',
            contentType: dexType === 'odos' || dexType === 'swoop' ? 'application/json' : undefined,
            data: dexType === 'odos' ? JSON.stringify(requestData) : (dexType === 'swoop' ? JSON.stringify(requestData) : undefined),
            timeout: parseInt(getFromLocalStorage('waktuTunggu', 0)) * 1000, // Menggunakan getFromLocalStorage
            headers: dexType === '0x' ? {
                '0x-api-key': "6f5d5c4d-bfdd-4fc7-8d3f-d3137094feb5",
            } : undefined,
            beforeSend: function () {
                var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp; ' + dexType.toUpperCase() + '</div>';
                IdCellTableDEX.html(loadingSpinner);
            },
    
            success: function (response, textStatus, xhr) {
                setTimeout(function () {
                    if (xhr.status === 200) {
                        if (!response || (typeof response !== 'object')) {
                            var errorMsg = "NO RESPONSE";
                            IdCellTableDEX.html("<a href=# title='" + errorMsg + "' class='error'><i class=bi bi-exclamation-circle></i> GAGAL</a>");
                            return;
                        }
    
                        if (response.error) {                                
                            IdCellTableDEX.html("<a href=# title='" + response.error + "' class='error'><i class=bi bi-exclamation-circle></i> KODE: " + response.error + "</a>");
                            return;
                        }
    
                        var amount_out, FeeSwap;
    
                        switch (dexType) {
                            case 'kyberswap':
                                amount_out = response.outputAmount / Math.pow(10, des_output);
                                FeeSwap = ((response.totalGas / Math.pow(10, 9)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case 'paraswap':
                                amount_out = (response.priceRoute.destAmount / Math.pow(10, des_output));
                                FeeSwap = parseFloat(response.priceRoute.gasCostUSD);
                                break;
                            case 'odos':
                                if (action === "sell") {
                                    amount_out = response.outValues / PriceRate; 
                                } else if (action === "buy") {
                                    amount_out = parseFloat(response.outAmounts) / Math.pow(10, des_output);
                                }                               
                                FeeSwap = response.gasEstimateValue;
                                break;
                            case '0x':
                                amount_out = response.buyAmount / Math.pow(10, des_output);
                                FeeSwap = ((response.estimatedGas / Math.pow(10, 9)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case '1inch':
                                amount_out = parseFloat(response.dstAmount) / Math.pow(10, des_output);
                                FeeSwap = ((response.gas / Math.pow(10, 9) * parseFloat(getFromLocalStorage('gasGWEI', 0)))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case 'swoop':
                                amount_out = parseFloat(response.amountOutWei) / Math.pow(10, des_output);
                                FeeSwap = ((response.feeWei / Math.pow(10, des_output)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                        }
    
                        
                        var selisihPersen, priceDEX, PNL;
    
                        if (action === "sell") {
                            var totalFee = parseFloat(modal * 0.001) + parseFloat(wd) + parseFloat(FeeSwap);
    
                            PNL = parseFloat(amount_out * PriceRate - modal);
                            priceDEX = ((Number(modal) + PNL) / (modal / price)).toFixed(0);
                            selisihPersen = ((priceDEX - price) / price) * 100;
    
                            EntryTableCEX(action, "sell_" + dexType, symbol, NameToken, price, wd, FeeSwap, totalFee);

                            LogEksekusi(dexType.toUpperCase(), "KIRI", NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee, wd, selisihPersen);
                        } else if (action === "buy") {
                            var totalFee = parseFloat(modal * 0.001) + parseFloat(FeeSwap);
    
                           // priceDEX = parseFloat(modal / amount_out).toFixed(9);
                           var priceDEX = parseFloat((modal/PriceRate)/((amount_out/PriceRate))*RateUSDT).toFixed(0); 
 
                           PNL = parseFloat(((modal / priceDEX) * price) - modal);
                            selisihPersen = ((price - priceDEX) / priceDEX) * 100;
    
                            EntryTableCEX(action, "buy_" + dexType, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            LogEksekusi(dexType.toUpperCase(), "KANAN", NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee, wd, selisihPersen);
                        }
    
                        var filterPNLValue = SavedModalData.FilterPNL == 0 ? totalFee + (modal * 0.1 / 100) : parseFloat(SavedModalData.FilterPNL);
                        var warna, PNLDisplay;
    
                        if (PNL > filterPNLValue) {
                            if (action === "sell") {
                                InfoSinyal('Kiri', 'sell', "sell_" + dexType, dexType.toUpperCase(), NameToken, PNL, totalFee);
                                MultisendMessage(Nama_Chain, dexType.toUpperCase(), 'KIRI', NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee);
                            } else if (action === "buy") {
                                InfoSinyal('Kanan', 'buy', "buy_" + dexType, dexType.toUpperCase(), NameToken, PNL, totalFee);
                                MultisendMessage(Nama_Chain, dexType.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee);                                   
                            }    
                            var audio = new Audio('audio.mp3');  // Ganti dengan path file suara yang sesuai
                            audio.play();
                            warna = "ijo"; 
                        } else {
                            warna = ""; 
                        }
                        
                        PNLDisplay = "<span class='uk-text-warning'>PNL:</span>" + PNL.toFixed(2) + "#<span class='uk-label " + (warna === "ijo" ? "uk-label-success" : "uk-label-danger") + "'>" + (PNL - totalFee).toFixed(2) + "</span>";
                        
                        if (action === "sell") {
                            IdCellTableDEX.html("<a href='" + link + "' target='_blank'><label class=uk-text-danger>Rp. " +priceDEX  + " <br/> "+(priceDEX/RateUSDT).toFixed(8)+"$ </label></a><br/>" + PNLDisplay).addClass(warna);
                        } else if (action === "buy") {
                            IdCellTableDEX.html("<a href='" + link + "' target='_blank'><label class=uk-text-primary>Rp. " +priceDEX  + " <br/> "+(priceDEX/RateUSDT).toFixed(8)+"$ </label></a><br/>" + PNLDisplay).addClass(warna);
                        }
                    
                        
                        IdCellTableCEX.addClass(warna);
                    }
                }, 0);
            },
            error: function (xhr, status, error) {
                var alertMessage = "Terjadi kesalahan";
                var warna = "merah";
    
                switch (xhr.status) {
                    case 0:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alertMessage = errorResponse.detail || errorResponse.description || "SERING SCAN";
                        } catch (e) {
                            warna = "limit";
                            getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, dexType, PriceRate, ServerCORS);
                        }
                        break;
                    case 400:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alertMessage = errorResponse.detail || errorResponse.description || "KONEKSI BURUK";
                        } catch (e) {
                            alertMessage = "KONEKSI LAMBAT"; // Jika parsing gagal
                        }
                        break;
                    case 403:
                        alertMessage = "AKSES DIBLOK";
                        break;
                    case 404:
                        alertMessage = "Permintaan tidak ditemukan";
                        break ;
                    case 429:
                        warna = "limit";
                        getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, dexType, PriceRate, ServerCORS);
                        break;
                    case 500:
                        alertMessage = "GAGAL DAPATKAN DATA";
                        break;
                    case 503:
                        alertMessage = "Layanan tidak tersedia";
                        break;
                    case 502:
                        alertMessage = "Respons tidak valid";
                        break;
                    default:
                        alertMessage = "Status: " + xhr.status;
                }
    
                // Update the UI with the error message
                IdCellTableDEX.html(`<a href="${link}" title="${dexType.toUpperCase()} : ${alertMessage}" target="_blank"> <i class="bi bi-exclamation-circle"></i> ERROR </a>`).addClass(warna);
                IdCellTableCEX.addClass(warna);
            }, 
            complete: function () {
                selesaiProsesAnggota();
            }
        });
    }

   // Fungsi untuk mengecek harga pada CEX
    function getPriceCEX(coins, modal, index, callback) {

        var ISERVERCORS = parseInt(getFromLocalStorage('DATA_SERVERCORS', 0)); // Menggunakan getFromLocalStorage
        var indexrandom = Math.floor(Math.random() * SavedSettingData.SERVERCORS[ISERVERCORS].length);
        var selectedServer = SavedSettingData.SERVERCORS[ISERVERCORS][indexrandom];
        var RateUSDT = parseFloat(getFromLocalStorage('PriceRateUSDT', 0));

        $.ajax({
            url: "https://indodax.com/api/depth/" + coins.symbol + '',
            method: 'GET',
            timeout: parseInt(SavedSettingData.waktuTunggu) * 1000,
            success: function(data) {
                if (data.sell.length === 0 || data.buy.length === 0) {
                    console.warn('Empty asks or bids array. Skipping cekHarga ' + cex.toUpperCase());
                    callback(null, null);  // Indicate success with no data
                    selesaiProsesAnggota();
                } else {
                    cekPricePAIR();

                    var dataOUT = {};

                    // Harga dan volume pembelian
                    dataOUT.price_buy = data.sell[0] ? data.sell[0][0] : "N/A";
                    dataOUT.price_buy1 = data.sell[1] ? data.sell[1][0] : "N/A";
                    dataOUT.price_buy2 = data.sell[2] ? data.sell[2][0] : "N/A";
                    dataOUT.price_buy3 = data.sell[3] ? data.sell[3][0] : "N/A";
                    dataOUT.vol_buy = data.sell[0] ? ((parseFloat(data.sell[0][1]) * dataOUT.price_buy) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_buy1 = data.sell[1] ? ((parseFloat(data.sell[1][1]) * dataOUT.price_buy1) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_buy2 = data.sell[2] ? ((parseFloat(data.sell[2][1]) * dataOUT.price_buy2) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_buy3 = data.sell[3] ? ((parseFloat(data.sell[3][1]) * dataOUT.price_buy3) / RateUSDT).toFixed(2) : "N/A";

                    // Harga dan volume penjualan
                    dataOUT.price_sell = data.buy[0] ? data.buy[0][0] : "N/A";
                    dataOUT.price_sell1 = data.buy[1] ? data.buy[1][0] : "N/A";
                    dataOUT.price_sell2 = data.buy[2] ? data.buy[2][0] : "N/A";
                    dataOUT.price_sell3 = data.buy[3] ? data.buy[3][0] : "N/A";
                    dataOUT.vol_sell = data.buy[0] ? ((parseFloat(data.buy[0][1]) * dataOUT.price_sell) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_sell1 = data.buy[1] ? ((parseFloat(data.buy[1][1]) * dataOUT.price_sell1) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_sell2 = data.buy[2] ? ((parseFloat(data.buy[2][1]) * dataOUT.price_sell2) / RateUSDT).toFixed(2) : "N/A";
                    dataOUT.vol_sell3 = data.buy[3] ? ((parseFloat(data.buy[3][1]) * dataOUT.price_sell3) / RateUSDT).toFixed(2) : "N/A";

                    dataOUT.symbol = GantiSymbol(coins.symbol, "IDR", "");
                    dataOUT.modal = modal;
                    dataOUT.amount_in_sell = data.sell[0] ? (modal * RateUSDT) / data.sell[0][0] : "N/A";
                    dataOUT.amount_in_buy = modal / parseFloat(getFromLocalStorage('PriceRateSell', 0)); // Menggunakan getFromLocalStorage
                    dataOUT.feeWD = 6;

                    dataOUT.PriceRateBuy = parseFloat(getFromLocalStorage('PriceRateBuy', 0)); // Menggunakan getFromLocalStorage
                    dataOUT.PriceRateSell = parseFloat(getFromLocalStorage('PriceRateSell', 0)); // Menggunakan getFromLocalStorage
                    dataOUT.PriceRateUSDT = RateUSDT;

                    // Mengupdate HTML untuk volume dan harga beli
                    $("#vol1_buy_cex_" + dataOUT.symbol).html(
                        "<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>"
                    );
                    $("#vol2_buy_cex_" + dataOUT.symbol).html(
                        "<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>"
                    );

                    // Mengupdate HTML untuk volume dan harga jual
                    $("#vol1_sell_cex_" + dataOUT.symbol).html(
                        "<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>"
                    );
                    $("#vol2_sell_cex_" + dataOUT.symbol).html(
                        "<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>"
                    );

                    callback(null, dataOUT);
                }
            },
            error: function(error) {
                callback(null, null);  // Indicate success with no data
                toastr.error('KONEKSI ' + NameCEX.toUpperCase() + ' GAGAL TOKEN ' + GantiSymbol(coins.symbol, "IDR", "") + ' !!');
                selesaiProsesAnggota();
            }
        });
    }

    // Fungsi untuk mengecek harga pada SERVER2
    function getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, cex, PriceRate, ServerCORS) {
        var amount_in = Math.pow(10, des_input) * amount;
        var amount_in = BigInt(Math.round(Number(amount_in)));
    
        var NameToken = GantiSymbol(symbol, "IDR", "");
    
        var IdCellTableDEX = GetIdCellDEX(action, posisi, NameToken);
        var IdCellTableCEX = GetIdCellCEX(action, posisi, NameToken);
    
        if (!IdCellTableDEX || !IdCellTableCEX) {
            toastr.error("GAGAL UPDATE TABEL HARGA");
        }
    
        var dexURL = {
            'kyberswap': "https://kyberswap.com/swap/" + Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'swoop': "https://app.swoop.exchange"
        }[cex] || "https://app.swoop.exchange";
    
        // Mengambil data setting dari localStorage
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
    
        var payload = {
            "chainId": Kode_Chain,
            "aggregatorSlug": cex,
            "sender": SavedSettingData.walletMETA,
            "inToken": {
                "chainId": Kode_Chain,
                "type": "TOKEN",
                "address": sc_input,
                "decimals": parseFloat(des_input)
            },
            "outToken": {
                "chainId": Kode_Chain,
                "type": "TOKEN",
                "address": sc_output,
                "decimals": parseFloat(des_output)
            },
            "amountInWei": String(amount_in),
            "slippageBps": "100",
            // Mengambil gasGWEI dari localStorage
            "gasPriceGwei": Number(getFromLocalStorage('gasGWEI', 0)),
        };
    
        $.ajax({
            url: 'https://swoop-backend.up.railway.app/swap',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            // Mengambil waktuTunggu dari localStorage dan mengonversinya ke milidetik
            timeout: parseInt(SavedSettingData.waktuTunggu || 30) * 1000,
            beforeSend: function () {
                var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp;' + cex.toUpperCase() + '</div>';
                if (action === "sell") {
                    $("#" + posisi + "_buy_cex_" + NameToken).empty().html(loadingSpinner);
                } else if (action === "buy") {
                    $("#sell_cex_" + posisi + "_" + NameToken).empty().html(loadingSpinner);
                }
            },
            success: function (response, textStatus, xhr) {
                setTimeout(function () {
                    if (xhr.status === 200 && !response || xhr.status === 0) {
                        var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp;' + dexType.toUpperCase() + '</div>';
                        IdCellTableDEX.html(loadingSpinner);
                    } else {
                        var amount_out = parseFloat(response.amountOutWei) / Math.pow(10, des_output);
                        var FeeSwap, PNL, priceDEX, totalFee, selisihPersen;
    
                        // Inisialisasi priceDEX
                        priceDEX = '';
    
                        if (action === "sell") {
                            FeeSwap = ((response.feeWei / Math.pow(10, des_output) * getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0));
                            PNL = parseFloat((amount_out * PriceRate) - modal);
                            priceDEX = ((Number(modal) + PNL) / (modal / price)).toFixed(9);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(wd) + parseFloat(FeeSwap);
                            selisihPersen = ((priceDEX - price) / price) * 100;
    
                            EntryTableCEX(action, "sell_" + cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
    
                            LogEksekusi(cex.toUpperCase(), "KIRI", NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee, wd, selisihPersen);
                        }
    
                        if (action === "buy") {
                            FeeSwap = ((response.feeWei / Math.pow(10, des_output)) * price) * getFromLocalStorage('gasGWEI', 0);
                           // priceDEX = parseFloat(modal / amount_out).toFixed(9);
                           var priceDEX = parseFloat((modal/PriceRate)/((amount_out/PriceRate))*RateUSDT).toFixed(8);  
                           PNL = parseFloat(((modal / priceDEX) * price) - modal);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(FeeSwap);
                            selisihPersen = ((price - priceDEX) / priceDEX) * 100;
    
                            EntryTableCEX(action, "buy_" + cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
    
                            LogEksekusi(cex.toUpperCase(), "KANAN", NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee, wd, selisihPersen);
                        }
    
                        var filterPNLValue = (SavedModalData.FilterPNL == 0) ? (totalFee + 0.05) : parseFloat(SavedModalData.FilterPNL);
    
                        if (PNL > filterPNLValue) {
    
                            if (action === "sell") {
                                InfoSinyal('Kiri', 'sell', "sell_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee);
                                MultisendMessage(Nama_Chain, cex.toUpperCase(), 'KIRI', NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee);
                            } else if (action === "buy") {
                                InfoSinyal('Kanan', 'buy', "buy_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee);
                                MultisendMessage(Nama_Chain, cex.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee);
                            }
                            var warna = "ijo";
                        } else {
                            var warna = "";
                        }
    
                        PNLDisplay = "<span class='uk-text-warning'>PNL:</span>" + PNL.toFixed(2) + "#<span class='uk-label " + (warna === "ijo" ? "uk-label-success" : "uk-label-danger") + "'>" + (PNL - totalFee).toFixed(2) + "</span>";
    
                        IdCellTableDEX.html("<a href='" + dexURL + "' target='_blank'>Rp. " + priceDEX + " <br/> "+(priceDEX/RateUSDT).toFixed(8)+"$</a><br/>" + PNLDisplay).addClass(warna);

                        IdCellTableCEX.addClass(warna);
                    }
                }, 0);
            },
            error: function (xhr, status, error) {
                var warna = "merah";
                var alert;
    
                // Menetapkan pesan alert berdasarkan status
                switch (xhr.status) {
                    case 0:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alert = errorResponse.detail || errorResponse.description || "KESERINGAN SCAN";
                        } catch (e) {
                            alert = "SERING SCAN";
                        }
                        break;
                    case 400:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alert = errorResponse.detail || errorResponse.description || "KONEKSI LAMBAT";
                        } catch (e) {
                            alert = "KONEKSI BURUK";
                        }
                        break;
                    case 403:
                        alert = "AKSES DIBLOK";
                        break;
                    case 404:
                        alert = "Permintaan tidak ditemukan";
                        break;
                    case 429:
                        warna = "limit";
                        alert = "KENA LIMIT";
                        break;
                    case 500:
                        alert = xhr.responseJSON?.message || "GAGAL DAPATKAN DATA";
                        break;
                    case 503:
                        alert = "Layanan tidak tersedia";
                        break;
                    default:
                        alert = "Status: " + xhr.status;
                }
                IdCellTableDEX.html(`<a href="${dexURL}" title="SERVER2 : ${alert}" target='_blank'> <i class="bi bi-x-square"></i> ERROR </a>`).addClass(warna);
                IdCellTableCEX.addClass(warna);
            },
        });
    }
    
    function countCheckedCEX() {
        let count = 0;
        const checkboxes = ['#D1INCH', '#DODOS', '#D0X', '#DKYBERSWAP', '#DPARASWAP'];
        checkboxes.forEach(checkbox => {
            if ($(checkbox).is(':checked')) {
                count++;
            }
        });
        return count;
    }

    function Scanning(coins, index) {
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
        var statusChecked = coins.status ? 'checked' : '';
        var NameToken = GantiSymbol(coins.symbol, "IDR", "");
        var linkStok = ' [ <a href="' + URL_Chain + '/token/' + coins.sc + '?a=' + WALLETCEX + '" target="_blank"> STOK 1 </a>] <br/>[ <a href="' + URL_Chain + '/token/' + coins.sc + '?a=' + WALLETCEX + '" target="_blank"> STOK 2</a>]';
        var linkDefillama = "<span style=color:orange;><a href=https://swap.defillama.com/?chain=" + Nama_Chain + "&from=" + coins.sc + "&to=" + SavedSettingData.scAddressPair + " target=_blank> DEFILLAMA</a></span>";
        var linkUNIDEX = "<span style=color:orange;><a href=https://app.unidex.exchange/?chain=" + Nama_Chain + "&from=" + coins.sc + "&to=" + SavedSettingData.scAddressPair + " target=_blank> UNIDEX</a></span>";

        $("#TabelHarga").append(
            "<tr>" +
                "<td id=vol1_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_1inch id=buy_cex_sell_1inch_" + NameToken + "></td>" +
                "<td class=dx_odos id=buy_cex_sell_odos_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=buy_cex_sell_kyberswap_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=buy_cex_sell_paraswap_" + NameToken + "></td>" +
                "<td class=dx_0x id=buy_cex_sell_0x_" + NameToken + "></td>" +
                "<td rowspan=2 style=background-color:#90b5ff;><input type=checkbox class=statusKoinCheckbox data-index=" + coins.symbol + "  " + statusChecked + "> <b style=color:black;>" + NameToken + "</b> <a href=" + URL_Chain + "/address/" + coins.sc + " target=_blank>[SC] </a> </br>  " + linkStok + " <br/> " + linkDefillama + "<br/> " + linkUNIDEX + "</td>" +

                "<td class=dx_1inch id=sell_cex_buy_1inch_" + NameToken + "></td>" +
                "<td class=dx_odos id=sell_cex_buy_odos_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=sell_cex_buy_kyberswap_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=sell_cex_buy_paraswap_" + NameToken + "></td>" +
                "<td class=dx_0x id=sell_cex_buy_0x_" + NameToken + "></td>" +
                "<td id=vol1_sell_cex_" + NameToken + "></td>" +
            "</tr>" +
            "<tr>" +
                "<td id=vol2_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_1inch id=sell_1inch_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_odos id=sell_odos_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=sell_kyberswap_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=sell_paraswap_buy_cex_" + NameToken + "></td>" +
                "<td class=dx_0x id=sell_0x_buy_cex_" + NameToken + "></td>" +

                "<td class=dx_1inch id=buy_1inch_sell_cex_" + NameToken + "></td>" +
                "<td class=dx_odos id=buy_odos_sell_cex_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=buy_kyberswap_sell_cex_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=buy_paraswap_sell_cex_" + NameToken + "></td>" +
                "<td class=dx_0x id=buy_0x_sell_cex_" + NameToken + "></td>" +
                "<td id=vol2_sell_cex_" + NameToken + "></td>" +
            "</tr>"
        );

        const dexList = [
            { id: 'D1INCH', withdraw: SavedModalData.ModalKiri1INCH, deposit: SavedModalData.ModalKanan1INCH, dex: '1inch' },
            { id: 'DODOS', withdraw: SavedModalData.ModalKiriODOS, deposit: SavedModalData.ModalKananODOS, dex: 'odos' },
            { id: 'D0X', withdraw: SavedModalData.ModalKiri0X, deposit: SavedModalData.ModalKanan0X, dex: '0x' },
            { id: 'DKYBERSWAP', withdraw: SavedModalData.ModalKiriKYBERSWAP, deposit: SavedModalData.ModalKananKYBERSWAP, dex: 'kyberswap' },
            { id: 'DPARASWAP', withdraw: SavedModalData.ModalKiriPARASWAP, deposit: SavedModalData.ModalKananPARASWAP, dex: 'paraswap' }
        ];

        //StatusWalletCEX(NameToken).then(result => {
            if ( $('#ls').is(':checked')) {
                dexList.forEach(({ id, withdraw, dex }) => {
                    if ($('#' + id).is(':checked')) {
                        getPriceCEX(coins, withdraw, index + 1, function (error, result) {
                            if (error) {
                                console.error(`Error while fetching price for ${dex}:`, error);
                                $("#buy_cex_sell_" + dex + "_" + NameToken).text("CEK BUY..").toggleClass('merah');
                                $("#sell_" + dex + "_buy_cex_" + NameToken).toggleClass('merah');
                            } else if (result) {
                                getPriceDEX(result.modal, coins.sc, coins.desimal, SavedSettingData.scAddressPair, SavedSettingData.desPair, result.amount_in_sell, result.price_buy, "sell", coins.symbol, "sell_" + dex, result.feeWD, index, result.PriceRateBuy, dex, function (error, response) {
                                });
                            } else {
                                $("#sell_" + dex + "_buy_cex_" + NameToken).html(`<a href="https://indodax.com/market/${coins.symbol}" title="'CEX : GAGAL DAPAT HARGA'" target="_blank"> <i class="bi bi-dash-circle"></i> ERROR </a>`).toggleClass("merah");

                                $("#buy_cex_sell_" + dex + "_" + NameToken).toggleClass('merah');
                                console.warn(`Result is null for ${dex}, ${NameToken} POSISI KIRI.`);
                            }
                        });
                    }
                });
            }

            if ($('#rs').is(':checked')) {
                dexList.forEach(({ id, deposit, dex }) => {
                    if ($('#' + id).is(':checked')) {
                        getPriceCEX(coins, deposit, index + 1, function (error, result) {
                            if (error) {
                                console.error(`Error while fetching price for ${dex}:`, error);
                                $("#sell_cex_buy_" + dex + "_" + NameToken).html("CEK BUY..").toggleClass('merah');
                                $("#buy_" + dex + "_sell_cex_" + NameToken).toggleClass('merah');
                            } else if (result) {
                                getPriceDEX(result.modal, SavedSettingData.scAddressPair, SavedSettingData.desPair, coins.sc, coins.desimal, result.amount_in_buy, result.price_sell, "buy", coins.symbol, "buy_" + dex, result.feeWD, index, result.PriceRateSell, dex, function (error, response) {
                                  //  console.warn(NameToken + "DONE KANAN KECIL " + dex.toUpperCase() + "!");
                                });
                            } else {
                                $("#sell_cex_buy_"+ dex + "_" + NameToken).html(`<a href="https://indodax.com/market/${coins.symbol}" title="'CEX : GAGAL DAPAT HARGA'" target="_blank"> <i class="bi bi-dash-circle"></i> ERROR </a>`).toggleClass("merah");

                                $("#buy_" + dex + "_sell_cex_" + NameToken).toggleClass('merah');
                                console.warn(`Result is null for ${dex}, ${NameToken} POSISI KANAN.`);
                            }
                        });
                    }
                });
            }
            /*
            if (!result.withdrawActive || !result.depositActive) {
                const checkedCountCEX = countCheckedCEX();
                for (let i = 0; i < checkedCountCEX; i++) {
                    const dexes = ['1inch', 'odos', '0x', 'kyberswap', 'paraswap'];
                    dexes.forEach(dex => {
                        if (!result.withdrawActive) {
                            $("#buy_cex_sell_" + dex + "_" + NameToken).text("---").addClass('putih');
                            $("#sell_" + dex + "_buy_cex_" + NameToken).addClass('putih');
                            selesaiProsesAnggota();
                        }
                        if (!result.depositActive) {
                            $("#sell_cex_buy_" + dex + "_" + NameToken).text("---").addClass('putih');
                            $("#buy_" + dex + "_sell_cex_" + NameToken).addClass('putih');
                            selesaiProsesAnggota();
                        }
                    });
                }
            }
            */
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     toastr.error("UPDATE WALLET CEX DAHULU!!!");
        // });

        updateTableVisibility();
    }

    // fungsi untuk mengelolah tampilan progress bar
    function updateProgress(totalscanned, token) {
        // Mengambil nilai dari localStorage menggunakan getFromLocalStorage
        var countTrueStatus = getFromLocalStorage("TotalCoins", 1); // Default ke 1 jika tidak ditemukan
    
        var mulai = parseInt(getFromLocalStorage('startTime', new Date().getTime())); // Default ke waktu sekarang jika tidak ditemukan
        var endTime = new Date().getTime(); // Waktu akhir setelah panggilan REST API berhasil
    
        var duration = (endTime - mulai) / 1000; // Durasi panggilan API dalam detik
        saveToLocalStorage("duration", duration); // Simpan durasi ke localStorage
    
        // Hitung waktu mulai dan berakhir
        var startTimeFormatted = new Date(mulai).toLocaleTimeString(); // Format waktu mulai
        var endTimeFormatted = new Date(endTime).toLocaleTimeString(); // Format waktu akhir
    
        // Menghitung persentase progres
        var perulangan = totalscanned / countTrueStatus;
        $('#scanprogress').html('CHECK - ' + token + ' [ ' + totalscanned + ' / ' + countTrueStatus + ' coin] ::  Mulai: ' + startTimeFormatted + ' ~ DURASI [' + parseFloat(duration / 60).toFixed(2) + ' Menit]').css({
            "color": "blue",
            "text-align": "left"
        });
        $('#bar').css('width', (totalscanned / countTrueStatus * 100) + '%');
    
        // Jika proses scanning selesai
        if (totalscanned >= countTrueStatus) {
            if (autorun == true) {
                $('#scanprogress').html('Mengulangi scanning dalam 7 detik.');
    
                setTimeout(function () {
                    $('tbody tr').remove();
                    var startTime = new Date().getTime();
                    saveToLocalStorage('startTime', startTime); // Simpan waktu mulai baru ke localStorage
    
                    setNullInfo(); // Reset informasi
                    processTokenData(tokens, groupSize); // Proses data token
                }, 7000);
            } else {
                $('#scanprogress').html('SCANNING SELESAI!! ' + endTimeFormatted + ' ~ DURASI [' + parseFloat(duration / 60).toFixed(2) + ' Menit]').css({
                    "color": "black",
                    "text-align": "right"
                });
    
                $("button#startSCAN.uk-button.uk-button-primary").show();
                $('#syncDATA, #set-modal, #cek_wallet, a').css('pointer-events', 'auto').css('opacity', '1');
                $("#refresh").hide();
            }
        }
    }
    
    $("#refresh").click(function () {
        location.reload();
        //toastr.success('REFRESH DONE!!');
        alert("REFRESH AKAN DILAKUKAN...!!");
        $("button#startSCAN.uk-button.uk-button-primary").hide();
    });

    function sendStatusTELE(user, status) {
        var users = [
            { chat_id: SavedSettingData.ID_GRUP }
        ];

        var token = SavedSettingData.TOKEN;
        var apiUrl = 'https://api.telegram.org/bot' + token + '/sendMessage';

        // Ambil data dari localStorage dan parse sebagai JSON object
        var data = getFromLocalStorage('ID','');

        var message = " #" + user.toUpperCase() + " is <b>[ " + status + " ]</b>" +
            "\n <b> MARKET : </b>" +Nama_Chain.toUpperCase()+' '+NameCEX.toUpperCase()+
            "\n <b> ID UNIX : </b>" + data.id +
            "\n <b> PROVIDER : </b> " + data.name +
            "\n <b> IP : </b>" + data.ip+
            "\n ----------------------------------------------";

        // Loop melalui daftar pengguna
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var chatId = user.chat_id; // Ganti dengan ID chat pengguna

            // Membuat permintaan POST menggunakan jQuery
            $.ajax({
            url: apiUrl,
            method: "POST",
            data: {
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: true
            },
            success: function(response) {
                // console.log("Message sent successfully");
            },
            error: function(xhr, status, error) {
                console.log("Error sending message:", error);
            }
            });
        }
        }

        // fungsi untuk mengirim info ke grup telegram
        function MultisendMessage(chain, dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee) {
            // Mengambil user dari localStorage menggunakan getFromLocalStorage
            var user = getFromLocalStorage('user', 'Unknown User').toUpperCase(); // Gunakan default 'Unknown User' jika tidak ada data
        
            var source = posisi === "KIRI" 
                ? "<b>#" + NameCEX.toUpperCase() + " >>  " + dex.toUpperCase() + "</b>" 
                : posisi === "KANAN" 
                ? "<b>#" + dex.toUpperCase() + " >> " + NameCEX.toUpperCase() + "</b>" 
                : "<b>Unknown Position</b>";
        
            var opit = Number(PNL) - Number(totalFee);    
        
            var message = 
                "<b>#" + Nama_Chain.toUpperCase() + "</b> ~ " + user +
                " \n ----------------------------------------- \n SOURCE: " + source +
                " \n TOKEN: <b>#" + token + "</b> " + " | PROFIT: <b>" + opit.toFixed(2) + "$ </b> " +
                " \n MODAL: <b> " + modal + "$</b> | PNL: <b>" + PNL.toFixed(2) + "$ </b> " +
                " \n <b>BUY: </b> " + priceBUY +
                " \n <b>SELL: </b>" + priceSELL + 
                " \n FEETOTAL: <b>" + totalFee.toFixed(2) + "$</b> | SWAP:<b>" + FeeSwap.toFixed(2) + "$</b>" +
                " \n -----------------------------------------";
        
            // Mengambil setting dari localStorage
            var SavedSettingData = getFromLocalStorage('DATA_SETTING', { ID_GRUP: 0, TOKEN: '' });
            var users = [
                { chat_id: SavedSettingData.ID_GRUP } // Menggunakan ID grup yang disimpan di localStorage
            ];
        
            var token = SavedSettingData.TOKEN; // Menggunakan token yang disimpan di localStorage
            var apiUrl = 'https://api.telegram.org/bot' + token + '/sendMessage';
        
            // Loop melalui daftar pengguna dan mengirim pesan
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                var chatId = user.chat_id; // ID chat pengguna
        
                // Membuat permintaan POST menggunakan jQuery
                $.ajax({
                    url: apiUrl,
                    method: "POST",
                    data: {
                        chat_id: chatId,
                        text: message,
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    },
                    success: function (response) {
                        // console.log("Message sent successfully");
                    },
                    error: function (xhr, status, error) {
                        // console.log("Error sending message:", error);
                    }
                });
            }
        }
        
});
