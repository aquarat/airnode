"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var ethers_1 = require("ethers");
var admin_1 = require("@api3/admin");
var src_1 = require("../src");
var getSponsorWallet = function (sponsorAddress) {
    var derivationPath = (0, admin_1.deriveWalletPathFromSponsorAddress)(sponsorAddress);
    var airnodeSecrets = (0, src_1.readAirnodeSecrets)();
    var provider = (0, src_1.getProvider)();
    return ethers_1.ethers.Wallet.fromMnemonic(airnodeSecrets.AIRNODE_WALLET_MNEMONIC, derivationPath).connect(provider);
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var integrationInfo, airnodeRrp, airnodeWallet, provider, sponsor, args, output, sponsorWalletAddress, balance, amountToSend, sponsorWallet, sponsorWalletBalance, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                integrationInfo = (0, src_1.readIntegrationInfo)();
                return [4 /*yield*/, (0, src_1.getDeployedContract)('@api3/protocol/contracts/rrp/AirnodeRrp.sol')];
            case 1:
                airnodeRrp = _c.sent();
                airnodeWallet = (0, src_1.getAirnodeWallet)();
                provider = (0, src_1.getProvider)();
                sponsor = ethers_1.ethers.Wallet.fromMnemonic(integrationInfo.mnemonic).connect(provider);
                args = [
                    "--providerUrl " + integrationInfo.providerUrl,
                    "--airnodeRrp " + airnodeRrp.address,
                    "--airnodeAddress " + airnodeWallet.address,
                    "--sponsorAddress " + sponsor.address,
                    "--xpub " + (0, src_1.getAirnodeXpub)(airnodeWallet),
                ];
                output = (0, child_process_1.execSync)("yarn api3-admin derive-sponsor-wallet-address " + args.join(' ')).toString();
                sponsorWalletAddress = output.split('Sponsor wallet address:')[1].trim();
                return [4 /*yield*/, sponsor.getBalance()];
            case 2:
                balance = _c.sent();
                amountToSend = ethers_1.ethers.utils.parseEther('0.1');
                if (balance.lt(amountToSend))
                    throw new Error("Sponsor account (" + sponsor.address + ") doesn't have enough funds!");
                return [4 /*yield*/, sponsor.sendTransaction({ to: sponsorWalletAddress, value: amountToSend })];
            case 3:
                _c.sent();
                sponsorWallet = getSponsorWallet(sponsor.address);
                _b = (_a = ethers_1.ethers.utils).formatEther;
                return [4 /*yield*/, sponsorWallet.getBalance()];
            case 4:
                sponsorWalletBalance = _b.apply(_a, [_c.sent()]);
                src_1.cliPrint.info("Successfully sent funds to sponsor wallet address: " + sponsorWallet.address + ".");
                src_1.cliPrint.info("Current balance: " + sponsorWalletBalance);
                return [2 /*return*/];
        }
    });
}); };
(0, src_1.runAndHandleErrors)(main);
//# sourceMappingURL=derive-and-fund-sponsor-wallet.js.map