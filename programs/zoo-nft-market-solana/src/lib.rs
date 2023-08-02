mod error;
mod instructions;
mod states;

use anchor_lang::prelude::*;
use instructions::market::cancel_order::*;
use instructions::market::create_order::*;
use instructions::market::fill_order::*;
use instructions::mint::mint::*;

declare_id!("3G2P8BrP9v3qJMXMi5mmyFthnDWtXUHScEYHWcw8G2Qq");

#[program]
pub mod zoo_nft_market_solana {
    use super::*;
    pub fn set_admin_address(
        ctx: Context<Initialize>,
        subscription_fees_wallet_add: Pubkey,
    ) -> Result<()> {
        // Verify the caller is a signer (admin)
        if !ctx.accounts.signer.is_signer {
            return Err(ErrorCode::Unauthorized.into());
        }
        ctx.accounts.new_account.subscription_fees_wallet_add = subscription_fees_wallet_add;
        msg!("Changed data to: {}!", subscription_fees_wallet_add); // Message will show up in the tx logs
        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        creator_key: Pubkey,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::mint::mint::mint_nft(ctx, creator_key, name, symbol, uri)
    }
    pub fn create_order(ctx: Context<CreateOrder>, memo: String, price: u64) -> Result<()> {
        instructions::market::create_order::create_order(ctx, memo, price)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        instructions::market::cancel_order::cancel_order(ctx)
    }

    pub fn fill_order(ctx: Context<FillOrder>) -> Result<()> {
        instructions::market::fill_order::fill_order(ctx)
    }
}
#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 32 bytes come from NewAccount.data being type Pubkey.
    // (Pubkey = 32 bytes)
    #[account(init, payer = signer, space = 8 + 32)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    subscription_fees_wallet_add: Pubkey, // Add a field to store the admin address
}

// Error codes for custom errors
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only the admin can call this function.")]
    Unauthorized,
}
