mod instructions;
mod states;
mod error;

use anchor_lang::prelude::*;
use instructions::mint::mint::*;
use instructions::market::create_order::*;
use instructions::market::cancel_order::*;
use instructions::market::fill_order::*;

declare_id!("D6oUwPksdxCJLdiJwUUCn6XPGsUXAsXhPdsMfiULPkLa");

#[program]
pub mod zoo_nft_market_solana {
    use super::*;
    pub fn set_admin_address(ctx: Context<SetAdminAddress>, admin_address: Pubkey) -> Result<()> {
        ctx.accounts.new_account.admin_fees_wallet_address = admin_address;
        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }

    pub fn create_order(
        ctx: Context<CreateOrder>,
        memo: String,
        price: u64
    ) -> Result<()> {
        instructions::market::create_order::create_order(ctx, memo, price)
    }

    pub fn cancel_order(
        ctx: Context<CancelOrder>
    ) -> Result<()> {
        instructions::market::cancel_order::cancel_order(ctx)
    }

    pub fn fill_order(ctx: Context<FillOrder>) -> Result<()> {
        instructions::market::fill_order::fill_order(ctx)
    }



#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
    admin_fees_wallet_address: Pubkey, // Add a field to store the admin address
}

#[derive(Accounts)]
pub struct SetAdminAddress<'info> {
    #[account(mut)]
    pub new_account: Account<'info, NewAccount>,
    pub admin_key: AccountInfo<'info>, // AccountInfo for the admin's public key
    pub signer: Signer<'info>,
}
}
